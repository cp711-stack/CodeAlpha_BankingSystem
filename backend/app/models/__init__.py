from app.models.customer import Customer
from app.models.account import Account
from app.models.transaction import Transaction
from app.models.analytics import ExpenseCategory, SpendingPattern, FinancialHealthScore, FraudAlert

# This allows easy importing of all models from app.models
__all__ = [
    "Customer",
    "Account",
    "Transaction",
    "ExpenseCategory",
    "SpendingPattern",
    "FinancialHealthScore",
    "FraudAlert"
]
