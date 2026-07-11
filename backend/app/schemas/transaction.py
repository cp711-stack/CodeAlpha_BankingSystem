from pydantic import BaseModel, condecimal
from datetime import datetime
from typing import Optional
from decimal import Decimal

class DepositRequest(BaseModel):
    account_number: str
    amount: condecimal(gt=Decimal('0.00'), decimal_places=2) # type: ignore

class WithdrawRequest(BaseModel):
    account_number: str
    amount: condecimal(gt=Decimal('0.00'), decimal_places=2) # type: ignore
    description: Optional[str] = "Cash Withdrawal"

class TransferRequest(BaseModel):
    from_account: str
    to_account: str
    amount: condecimal(gt=Decimal('0.00'), decimal_places=2) # type: ignore
    description: Optional[str] = None

class TransactionResponse(BaseModel):
    id: str
    account_number: str
    type: str
    amount: Decimal
    balance_after: Decimal
    description: Optional[str] = None
    category: Optional[str] = None
    created_at: datetime

    model_config = {"from_attributes": True}
