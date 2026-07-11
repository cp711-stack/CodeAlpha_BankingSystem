from pydantic import BaseModel, condecimal, constr
from datetime import datetime
from typing import Optional
from decimal import Decimal

class AccountCreate(BaseModel):
    type: str  # SAVINGS or CURRENT
    initial_deposit: condecimal(ge=Decimal('0.00'), decimal_places=2) # type: ignore

class AccountUpdate(BaseModel):
    status: str # ACTIVE, FROZEN, CLOSED

class AccountResponse(BaseModel):
    account_number: str
    customer_id: str
    type: str
    balance: Decimal
    status: str
    created_at: datetime

    model_config = {"from_attributes": True}
