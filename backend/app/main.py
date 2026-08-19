from datetime import date, timedelta
from ipaddress import IPv4Address
from decimal import Decimal
from uuid import uuid4

import firebase_admin
from firebase_admin import credentials
from firebase_admin import initialize_app
from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select
from sqlalchemy.orm import Session

from .auth import get_current_user, require_admin
from .config import settings
from .database import Base, SessionLocal, engine, get_db
from .models import Customer, Invoice, Plan, User
from .schemas import CustomerCreate, CustomerOut, InvoiceOut, PlanOut, ProvisionRequest, RoleUpdate, StatusUpdate, UserOut

if not firebase_admin._apps:
    firebase_credentials = credentials.Certificate(settings.firebase_service_account_path) if settings.firebase_service_account_path else credentials.ApplicationDefault()
    initialize_app(firebase_credentials, {"projectId": settings.firebase_project_id})

app = FastAPI(title="NetStream ISP Biller API", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def seed_data(db: Session) -> None:
    plan_definitions = [
        ("p1", "Home Basic", "25 Mbps", Decimal("30.00")),
        ("p2", "Home Turbo", "50 Mbps", Decimal("45.00")),
        ("p3", "Fiber Pro", "100 Mbps", Decimal("70.00")),
        ("p4", "Business Ultra", "500 Mbps", Decimal("150.00")),
    ]
    existing_plan_ids = set(db.scalars(select(Plan.id)).all())
    db.add_all(
        Plan(id=plan_id, name=name, speed=speed, price=price)
        for plan_id, name, speed, price in plan_definitions
        if plan_id not in existing_plan_ids
    )
    db.commit()

    plan_prices = {plan_id: price for plan_id, _, _, price in plan_definitions}
    sample_customers = [
        ("Avery Johnson", "avery.johnson@example.com", "201-555-0101", "12 Maple Street", "Newark", "NJ", "07102", "p2", "Active"),
        ("Mia Williams", "mia.williams@example.com", "201-555-0102", "34 Oak Avenue", "Jersey City", "NJ", "07302", "p3", "Active"),
        ("Noah Brown", "noah.brown@example.com", "201-555-0103", "56 Pine Road", "Paterson", "NJ", "07501", "p1", "Suspended"),
        ("Sophia Davis", "sophia.davis@example.com", "201-555-0104", "78 Cedar Lane", "Elizabeth", "NJ", "07201", "p4", "Active"),
        ("Liam Miller", "liam.miller@example.com", "201-555-0105", "90 Birch Drive", "Hoboken", "NJ", "07030", "p2", "Onboarding"),
        ("Isabella Wilson", "isabella.wilson@example.com", "201-555-0106", "101 Walnut Street", "Trenton", "NJ", "08608", "p3", "Active"),
        ("Ethan Moore", "ethan.moore@example.com", "201-555-0107", "23 River Road", "Princeton", "NJ", "08540", "p1", "Active"),
        ("Olivia Taylor", "olivia.taylor@example.com", "201-555-0108", "45 Summit Avenue", "Morristown", "NJ", "07960", "p2", "Suspended"),
        ("Lucas Anderson", "lucas.anderson@example.com", "201-555-0109", "67 Park Place", "New Brunswick", "NJ", "08901", "p3", "Active"),
        ("Emma Thomas", "emma.thomas@example.com", "201-555-0110", "89 Lakeview Drive", "Clifton", "NJ", "07011", "p1", "Onboarding"),
        ("Mason Jackson", "mason.jackson@example.com", "201-555-0111", "11 Garden Street", "Montclair", "NJ", "07042", "p4", "Active"),
        ("Ava White", "ava.white@example.com", "201-555-0112", "22 Hillside Road", "Wayne", "NJ", "07470", "p2", "Active"),
        ("James Harris", "james.harris@example.com", "201-555-0113", "33 Valley View", "Edison", "NJ", "08817", "p3", "Suspended"),
        ("Charlotte Martin", "charlotte.martin@example.com", "201-555-0114", "44 Franklin Street", "Hackensack", "NJ", "07601", "p1", "Active"),
        ("Benjamin Thompson", "benjamin.thompson@example.com", "201-555-0115", "55 Station Road", "Red Bank", "NJ", "07701", "p2", "Onboarding"),
        ("Amelia Garcia", "amelia.garcia@example.com", "201-555-0116", "66 Brookside Avenue", "Union", "NJ", "07083", "p3", "Active"),
        ("Henry Martinez", "henry.martinez@example.com", "201-555-0117", "77 Meadow Lane", "Bayonne", "NJ", "07002", "p1", "Active"),
        ("Harper Robinson", "harper.robinson@example.com", "201-555-0118", "88 Mill Street", "Westfield", "NJ", "07090", "p4", "Suspended"),
        ("Alexander Clark", "alexander.clark@example.com", "201-555-0119", "99 Chestnut Avenue", "Summit", "NJ", "07901", "p2", "Active"),
        ("Evelyn Rodriguez", "evelyn.rodriguez@example.com", "201-555-0120", "100 Prospect Street", "Cranford", "NJ", "07016", "p3", "Onboarding"),
    ]
    customer_ids = []
    for index, (name, email, phone, address, city, state, zip_code, plan_id, status_value) in enumerate(sample_customers, start=1):
        customer_id = f"CUST-SAMPLE-{index:02d}"
        customer_ids.append((customer_id, name, plan_id))
        if db.get(Customer, customer_id):
            continue
        db.add(Customer(
            id=customer_id,
            full_name=name,
            email=email,
            phone=phone,
            address=address,
            city=city,
            state=state,
            zip_code=zip_code,
            plan_id=plan_id,
            ip_address="Pending Allocation" if status_value == "Onboarding" else f"192.168.10.{100 + index}",
            status=status_value,
            onboarded_date=date.today() - timedelta(days=index * 3),
        ))
    db.commit()

    for index, (customer_id, customer_name, plan_id) in enumerate(customer_ids, start=1):
        invoice_id = f"INV-SAMPLE-{index:02d}"
        if db.get(Invoice, invoice_id):
            continue
        db.add(Invoice(
            id=invoice_id,
            customer_id=customer_id,
            customer_name=customer_name,
            amount=plan_prices[plan_id],
            due_date=date.today() + timedelta(days=index - 10),
            status="Paid" if index % 4 == 0 else "Overdue" if index % 3 == 0 else "Open",
            generated_date=date.today() - timedelta(days=30),
        ))
    db.commit()


@app.on_event("startup")
def startup() -> None:
    Base.metadata.create_all(bind=engine)
    with SessionLocal() as db:
        seed_data(db)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/api/me", response_model=UserOut)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user


@app.get("/api/plans", response_model=list[PlanOut])
def list_plans(_: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.scalars(select(Plan).order_by(Plan.price)).all()


@app.get("/api/customers", response_model=list[CustomerOut])
def list_customers(_: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.scalars(select(Customer).order_by(Customer.onboarded_date.desc())).all()


@app.post("/api/customers", response_model=CustomerOut, status_code=status.HTTP_201_CREATED)
def create_customer(payload: CustomerCreate, _: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if not db.get(Plan, payload.plan_id):
        raise HTTPException(status_code=422, detail="Unknown plan")
    customer = Customer(id=f"CUST-{uuid4().hex[:8].upper()}", **payload.model_dump())
    db.add(customer)
    db.commit()
    db.refresh(customer)
    return customer


@app.patch("/api/customers/{customer_id}/status", response_model=CustomerOut)
def update_customer_status(customer_id: str, payload: StatusUpdate, _: User = Depends(get_current_user), db: Session = Depends(get_db)):
    customer = db.get(Customer, customer_id)
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    customer.status = payload.status
    db.commit()
    db.refresh(customer)
    return customer


@app.post("/api/customers/{customer_id}/provision", response_model=CustomerOut)
def provision_customer(customer_id: str, payload: ProvisionRequest, _: User = Depends(get_current_user), db: Session = Depends(get_db)):
    try:
        IPv4Address(payload.ip_address)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail="A valid IPv4 address is required") from exc
    customer = db.get(Customer, customer_id)
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    customer.status, customer.ip_address = "Active", payload.ip_address
    db.commit()
    db.refresh(customer)
    return customer


@app.get("/api/invoices", response_model=list[InvoiceOut])
def list_invoices(_: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.scalars(select(Invoice).order_by(Invoice.due_date)).all()


@app.post("/api/invoices/{invoice_id}/payment", response_model=InvoiceOut)
def record_payment(invoice_id: str, _: User = Depends(get_current_user), db: Session = Depends(get_db)):
    invoice = db.get(Invoice, invoice_id)
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    invoice.status = "Paid"
    db.commit()
    db.refresh(invoice)
    return invoice


@app.get("/api/users", response_model=list[UserOut])
def list_users(_: User = Depends(require_admin), db: Session = Depends(get_db)):
    return db.scalars(select(User).order_by(User.created_at.desc())).all()


@app.patch("/api/users/{user_id}/role", response_model=UserOut)
def update_user_role(user_id: str, payload: RoleUpdate, current_user: User = Depends(require_admin), db: Session = Depends(get_db)):
    if user_id == current_user.id and payload.role != "admin":
        raise HTTPException(status_code=422, detail="You cannot remove your own administrator access")
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.role = payload.role
    db.commit()
    db.refresh(user)
    return user
