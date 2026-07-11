from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.database import get_db
from app.models.customer import Customer
from app.models.account import Account
from app.models.transaction import Transaction
from app.schemas.account import AccountCreate, AccountResponse
from app.middleware.auth import get_current_user
from app.services.banking_service import create_account

router = APIRouter(prefix="/api/accounts", tags=["accounts"])

@router.get("/", response_model=List[AccountResponse])
async def list_my_accounts(
    current_user: Customer = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Account).filter(Account.customer_id == current_user.id))
    return result.scalars().all()

@router.post("/", response_model=AccountResponse, status_code=201)
async def create_new_account(
    account_data: AccountCreate,
    current_user: Customer = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    account = await create_account(
        db=db,
        customer_id=current_user.id,
        account_type=account_data.type,
        initial_deposit=account_data.initial_deposit
    )
    return account

@router.get("/{account_number}", response_model=AccountResponse)
async def get_account_details(
    account_number: str,
    current_user: Customer = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Account).filter(Account.account_number == account_number, Account.customer_id == current_user.id))
    account = result.scalars().first()
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    return account

@router.get("/{account_number}/statement")
async def get_account_statement(
    account_number: str,
    current_user: Customer = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Verify ownership
    result = await db.execute(select(Account).filter(Account.account_number == account_number, Account.customer_id == current_user.id))
    account = result.scalars().first()
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
        
    # Get transactions
    tx_result = await db.execute(
        select(Transaction)
        .filter(Transaction.account_number == account_number)
        .order_by(Transaction.created_at.desc())
    )
    transactions = tx_result.scalars().all()
    
    total_deposits = sum(tx.amount for tx in transactions if tx.type in ["DEPOSIT", "TRANSFER_IN"])
    total_withdrawals = sum(tx.amount for tx in transactions if tx.type in ["WITHDRAWAL", "TRANSFER_OUT"])
    
    return {
        "account": account,
        "transactions": transactions,
        "summary": {
            "total_deposits": total_deposits,
            "total_withdrawals": total_withdrawals,
            "closing_balance": account.balance
        }
    }
