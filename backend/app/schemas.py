from datetime import date
from pydantic import BaseModel, EmailStr, Field


class PlanOut(BaseModel):
    id: str
    name: str
    speed: str
    price: float

    model_config = {"from_attributes": True}


class CustomerCreate(BaseModel):
    full_name: str = Field(min_length=1, max_length=255)
    email: EmailStr
    phone: str
    address: str
    city: str
    state: str
    zip_code: str
    plan_id: str


class CustomerOut(CustomerCreate):
    id: str
    ip_address: str
    status: str
    onboarded_date: date

    model_config = {"from_attributes": True}


class StatusUpdate(BaseModel):
    status: str = Field(pattern="^(Active|Suspended)$")


class ProvisionRequest(BaseModel):
    ip_address: str


class InvoiceOut(BaseModel):
    id: str
    customer_id: str
    customer_name: str
    amount: float
    due_date: date
    status: str
    generated_date: date

    model_config = {"from_attributes": True}


class UserOut(BaseModel):
    id: str
    email: str
    display_name: str
    photo_url: str
    role: str

    model_config = {"from_attributes": True}


class RoleUpdate(BaseModel):
    role: str = Field(pattern="^(admin|user)$")
