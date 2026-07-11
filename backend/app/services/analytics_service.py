from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func
from datetime import datetime, date
from decimal import Decimal
from typing import List, Dict

from app.models.transaction import Transaction
from app.models.account import Account
from app.models.customer import Customer
from app.schemas.analytics import SpendingCategory, SpendingResponse

async def get_spending_by_category(db: AsyncSession, customer_id: str, month: date = None) -> SpendingResponse:
    if month is None:
        month = date.today().replace(day=1)
        
    # Get all accounts for customer
    acc_result = await db.execute(select(Account.account_number).filter(Account.customer_id == customer_id))
    account_numbers = [row[0] for row in acc_result.all()]
    
    if not account_numbers:
        return SpendingResponse(categories=[], total_spent=Decimal("0.00"), month=month.strftime("%Y-%m"))
        
    # Get all withdrawal/transfer_out transactions for these accounts in the given month
    next_month = month.replace(month=month.month % 12 + 1, year=month.year + (month.month // 12))
    
    query = (
        select(
            func.coalesce(Transaction.description, "Uncategorized").label("category"),
            func.sum(Transaction.amount).label("total"),
            func.count(Transaction.id).label("count")
        )
        .filter(Transaction.account_number.in_(account_numbers))
        .filter(Transaction.type.in_(["WITHDRAWAL", "TRANSFER_OUT"]))
        .filter(Transaction.created_at >= month)
        .filter(Transaction.created_at < next_month)
        .group_by(Transaction.description)
    )
    
    result = await db.execute(query)
    rows = result.all()
    
    categories = []
    total_spent = Decimal("0.00")
    
    for row in rows:
        total_spent += row.total
        
    for row in rows:
        percentage = float(row.total / total_spent * 100) if total_spent > 0 else 0.0
        categories.append(
            SpendingCategory(
                category=row.category,
                total=row.total,
                count=row.count,
                percentage=round(percentage, 2)
            )
        )
        
    # Sort by total descending
    categories.sort(key=lambda x: x.total, reverse=True)
    
    return SpendingResponse(
        categories=categories,
        total_spent=total_spent,
        month=month.strftime("%Y-%m")
    )

async def get_admin_overview(db: AsyncSession) -> Dict:
    customers = await db.execute(select(func.count(Customer.id)))
    accounts = await db.execute(select(func.count(Account.account_number)))
    deposits_query = await db.execute(select(func.sum(Transaction.amount)).filter(Transaction.type == "DEPOSIT"))
    transactions = await db.execute(select(func.count(Transaction.id)))
    
    active_accounts = await db.execute(select(func.count(Account.account_number)).filter(Account.status == "ACTIVE"))
    frozen_accounts = await db.execute(select(func.count(Account.account_number)).filter(Account.status == "FROZEN"))
    closed_accounts = await db.execute(select(func.count(Account.account_number)).filter(Account.status == "CLOSED"))
    
    return {
        "total_customers": customers.scalar() or 0,
        "total_accounts": accounts.scalar() or 0,
        "total_deposits": deposits_query.scalar() or Decimal("0.00"),
        "total_transactions": transactions.scalar() or 0,
        "active_accounts": active_accounts.scalar() or 0,
        "frozen_accounts": frozen_accounts.scalar() or 0,
        "closed_accounts": closed_accounts.scalar() or 0
    }
