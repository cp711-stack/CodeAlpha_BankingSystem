from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.database import get_db
from app.models.customer import Customer
from app.models.account import Account
from app.models.transaction import Transaction
from app.schemas.transaction import TransactionResponse, DepositRequest, WithdrawRequest, TransferRequest
from app.middleware.auth import get_current_user
from app.services.banking_service import deposit, withdraw, transfer

router = APIRouter(prefix="/api/transactions", tags=["transactions"])

async def verify_account_ownership(db: AsyncSession, account_number: str, customer_id: str):
    result = await db.execute(select(Account).filter(Account.account_number == account_number, Account.customer_id == customer_id))
    if not result.scalars().first():
        raise HTTPException(status_code=403, detail="Not authorized to access this account")

@router.post("/deposit", response_model=TransactionResponse)
async def perform_deposit(
    request: DepositRequest,
    current_user: Customer = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    await verify_account_ownership(db, request.account_number, current_user.id)
    return await deposit(db, request.account_number, request.amount)

@router.post("/withdraw", response_model=TransactionResponse)
async def perform_withdraw(
    request: WithdrawRequest,
    current_user: Customer = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    await verify_account_ownership(db, request.account_number, current_user.id)
    return await withdraw(db, request.account_number, request.amount, request.description)

@router.post("/transfer")
async def perform_transfer(
    request: TransferRequest,
    current_user: Customer = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    await verify_account_ownership(db, request.from_account, current_user.id)
    # Target account does not need ownership verification, just existence and active status
    tx_out, tx_in = await transfer(db, request.from_account, request.to_account, request.amount, request.description)
    return {"message": "Transfer successful", "transaction": tx_out}

@router.get("/{account_number}", response_model=List[TransactionResponse])
async def list_transactions(
    account_number: str,
    current_user: Customer = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    await verify_account_ownership(db, account_number, current_user.id)
    result = await db.execute(
        select(Transaction)
        .filter(Transaction.account_number == account_number)
        .order_by(Transaction.created_at.desc())
        .limit(100)
    )
    return result.scalars().all()
