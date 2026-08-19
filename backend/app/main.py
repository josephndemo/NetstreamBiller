from datetime import date
from ipaddress import IPv4Address
from uuid import uuid4

import firebase_admin
from firebase_admin import credentials
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
    firebase_admin.initialize_app(firebase_credentials)

app = FastAPI(title="NetStream ISP Biller API", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def seed_data(db: Session) -> None:
    if db.scalar(select(Plan.id).limit(1)):
        return
    db.add_all([
        Plan(id="p1", name="Home Basic", speed="25 Mbps", price=30),
        Plan(id="p2", name="Home Turbo", speed="50 Mbps", price=45),
        Plan(id="p3", name="Fiber Pro", speed="100 Mbps", price=70),
        Plan(id="p4", name="Business Ultra", speed="500 Mbps", price=150),
    ])
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
