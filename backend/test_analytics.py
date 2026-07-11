import asyncio
import sys
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func
from datetime import date
from app.database import get_db, AsyncSessionLocal
from app.models.transaction import Transaction

async def main():
    async with AsyncSessionLocal() as db:
        customer_id = "CUST00007"
        month = date.today().replace(day=1)
        next_month = month.replace(month=month.month % 12 + 1, year=month.year + (month.month // 12))
        
        from app.models.account import Account
        acc_result = await db.execute(select(Account.account_number).filter(Account.customer_id == customer_id))
        account_numbers = [row[0] for row in acc_result.all()]
        
        print(f"Accounts: {account_numbers}")
        
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
        
        try:
            result = await db.execute(query)
            rows = result.all()
            for row in rows:
                print(row)
        except Exception as e:
            print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(main())
