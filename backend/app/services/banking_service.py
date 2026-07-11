import uuid
from decimal import Decimal
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func
from fastapi import HTTPException
from app.models.account import Account
from app.models.transaction import Transaction
from app.models.customer import Customer
from app.ai.expense_categorizer import categorize_expense

MIN_SAVINGS_BALANCE = Decimal("500.00")

async def generate_customer_id(db: AsyncSession) -> str:
    result = await db.execute(select(func.count(Customer.id)))
    count = result.scalar() or 0
    return f"CUST{count + 1:05d}"

async def generate_account_number(db: AsyncSession) -> str:
    result = await db.execute(select(func.count(Account.account_number)))
    count = result.scalar() or 0
    return f"AC{count + 1:07d}"

async def generate_transaction_id(db: AsyncSession) -> str:
    result = await db.execute(select(func.count(Transaction.id)))
    count = result.scalar() or 0
    return f"TXN{count + 1:08d}"

async def get_account_for_update(db: AsyncSession, account_number: str) -> Account:
    # Use with_for_update() to lock the row
    result = await db.execute(
        select(Account).filter(Account.account_number == account_number).with_for_update()
    )
    account = result.scalars().first()
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    if account.status != "ACTIVE":
        raise HTTPException(status_code=400, detail=f"Cannot operate on {account.status} account")
    return account

async def create_account(db: AsyncSession, customer_id: str, account_type: str, initial_deposit: Decimal) -> Account:
    if initial_deposit < Decimal("0.00"):
        raise HTTPException(status_code=400, detail="Deposit cannot be negative")
    
    if account_type == "SAVINGS" and initial_deposit < MIN_SAVINGS_BALANCE:
        raise HTTPException(status_code=400, detail=f"Savings accounts require minimum {MIN_SAVINGS_BALANCE}")
        
    acc_num = await generate_account_number(db)
    
    new_account = Account(
        account_number=acc_num,
        customer_id=customer_id,
        type=account_type,
        balance=initial_deposit
    )
    
    db.add(new_account)
    
    if initial_deposit > Decimal("0.00"):
        txn_id = await generate_transaction_id(db)
        transaction = Transaction(
            id=txn_id,
            account_number=acc_num,
            type="DEPOSIT",
            amount=initial_deposit,
            balance_after=initial_deposit,
            description="Initial Deposit"
        )
        db.add(transaction)
        
    await db.commit()
    await db.refresh(new_account)
    return new_account

async def deposit(db: AsyncSession, account_number: str, amount: Decimal) -> Transaction:
    if amount <= Decimal("0.00"):
        raise HTTPException(status_code=400, detail="Amount must be positive")
        
    account = await get_account_for_update(db, account_number)
    
    account.balance += amount
    
    txn_id = await generate_transaction_id(db)
    transaction = Transaction(
        id=txn_id,
        account_number=account_number,
        type="DEPOSIT",
        amount=amount,
        balance_after=account.balance,
        description="Cash Deposit"
    )
    
    db.add(transaction)
    await db.commit()
    await db.refresh(transaction)
    return transaction

async def withdraw(db: AsyncSession, account_number: str, amount: Decimal, description: str = "Cash Withdrawal") -> Transaction:
    if amount <= Decimal("0.00"):
        raise HTTPException(status_code=400, detail="Amount must be positive")
        
    account = await get_account_for_update(db, account_number)
    
    if account.balance < amount:
        raise HTTPException(status_code=400, detail="Insufficient funds")
        
    if account.type == "SAVINGS" and (account.balance - amount) < MIN_SAVINGS_BALANCE:
        raise HTTPException(status_code=400, detail=f"Savings account must maintain minimum balance of {MIN_SAVINGS_BALANCE}")
        
    account.balance -= amount
    
    category = categorize_expense(description)
    
    txn_id = await generate_transaction_id(db)
    transaction = Transaction(
        id=txn_id,
        account_number=account_number,
        type="WITHDRAWAL",
        amount=amount,
        balance_after=account.balance,
        description=description,
        category=category
    )
    
    db.add(transaction)
    await db.commit()
    await db.refresh(transaction)
    return transaction

from typing import Optional

async def transfer(db: AsyncSession, from_account_num: str, to_account_num: str, amount: Decimal, description: Optional[str] = None) -> tuple[Transaction, Transaction]:
    if from_account_num == to_account_num:
        raise HTTPException(status_code=400, detail="Cannot transfer to same account")
        
    if amount <= Decimal("0.00"):
        raise HTTPException(status_code=400, detail="Amount must be positive")
        
    # Lock both accounts in a deterministic order to prevent deadlocks
    acc1_num, acc2_num = min(from_account_num, to_account_num), max(from_account_num, to_account_num)
    
    acc1 = await get_account_for_update(db, acc1_num)
    acc2 = await get_account_for_update(db, acc2_num)
    
    from_account = acc1 if acc1.account_number == from_account_num else acc2
    to_account = acc2 if acc2.account_number == to_account_num else acc1
    
    # Validation
    if from_account.balance < amount:
        raise HTTPException(status_code=400, detail="Insufficient funds")
        
    if from_account.type == "SAVINGS" and (from_account.balance - amount) < MIN_SAVINGS_BALANCE:
        raise HTTPException(status_code=400, detail=f"Savings account must maintain minimum balance of {MIN_SAVINGS_BALANCE}")
        
    # Update balances
    from_account.balance -= amount
    to_account.balance += amount
    
    # Create transactions
    tx_out_id = await generate_transaction_id(db)
    # Generate a new ID manually for the second transaction since it hasn't been committed yet
    base_id = int(tx_out_id.replace("TXN", ""))
    tx_in_id = f"TXN{base_id + 1:08d}"
    
    out_desc = f"{description} (Transfer to {to_account_num})" if description else f"Transfer to {to_account_num}"
    in_desc = f"{description} (Transfer from {from_account_num})" if description else f"Transfer from {from_account_num}"
    
    # Categorize based on description if provided
    category = categorize_expense(description) if description else "Transfers"
    
    tx_out = Transaction(
        id=tx_out_id,
        account_number=from_account_num,
        type="TRANSFER_OUT",
        amount=amount,
        balance_after=from_account.balance,
        description=out_desc,
        category=category
    )
    
    tx_in = Transaction(
        id=tx_in_id,
        account_number=to_account_num,
        type="TRANSFER_IN",
        amount=amount,
        balance_after=to_account.balance,
        description=in_desc,
        category=category
    )
    
    db.add(tx_out)
    db.add(tx_in)
    
    # Call fraud detector logic here in real system, omitted for brevity but should insert alerts if needed
    
    await db.commit()
    await db.refresh(tx_out)
    await db.refresh(tx_in)
    
    return tx_out, tx_in
