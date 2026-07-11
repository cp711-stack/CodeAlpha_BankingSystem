from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func

from app.database import get_db
from app.models.customer import Customer
from app.models.account import Account
from app.models.transaction import Transaction
from app.schemas.customer import CustomerResponse
from app.schemas.account import AccountResponse
from app.schemas.transaction import TransactionResponse
from app.middleware.auth import require_admin
from app.services.analytics_service import get_admin_overview

router = APIRouter(prefix="/api/admin", tags=["admin"])

@router.get("/customers", response_model=List[CustomerResponse])
async def get_all_customers(
    admin: Customer = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Customer))
    return result.scalars().all()

@router.get("/accounts", response_model=List[AccountResponse])
async def get_all_accounts(
    admin: Customer = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Account))
    return result.scalars().all()

@router.get("/transactions", response_model=List[TransactionResponse])
async def get_all_transactions(
    admin: Customer = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Transaction).order_by(Transaction.created_at.desc()).limit(100)
    )
    return result.scalars().all()

@router.patch("/accounts/{account_number}/freeze")
async def freeze_account(
    account_number: str,
    admin: Customer = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Account).filter(Account.account_number == account_number))
    account = result.scalars().first()
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
        
    account.status = "FROZEN"
    await db.commit()
    return {"message": f"Account {account_number} frozen successfully"}

@router.patch("/accounts/{account_number}/unfreeze")
async def unfreeze_account(
    account_number: str,
    admin: Customer = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Account).filter(Account.account_number == account_number))
    account = result.scalars().first()
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
        
    account.status = "ACTIVE"
    await db.commit()
    return {"message": f"Account {account_number} unfrozen successfully"}

@router.get("/analytics/overview")
async def get_overview_analytics(
    admin: Customer = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    return await get_admin_overview(db)

@router.get("/fraud-alerts")
async def get_fraud_alerts(
    admin: Customer = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    # This would normally query the FraudAlert table
    return []
