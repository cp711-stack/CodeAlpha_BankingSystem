from pydantic import BaseModel, EmailStr
from typing import Optional
from app.schemas.customer import CustomerResponse

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class RegisterRequest(BaseModel):
    name: str
    email: EmailStr
    phone: str
    address: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    customer: Optional[CustomerResponse] = None

class TokenData(BaseModel):
    customer_id: str
    role: str
