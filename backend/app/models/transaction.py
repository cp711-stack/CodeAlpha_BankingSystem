from sqlalchemy import Column, String, Numeric, DateTime, ForeignKey, Text, func
from sqlalchemy.orm import relationship
from app.database import Base

class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(String(50), primary_key=True, index=True)
    account_number = Column(String(50), ForeignKey("accounts.account_number", ondelete="CASCADE"), nullable=False)
    type = Column(String(20), nullable=False) # 'DEPOSIT', 'WITHDRAWAL', 'TRANSFER_IN', 'TRANSFER_OUT'
    amount = Column(Numeric(15, 2), nullable=False)
    balance_after = Column(Numeric(15, 2), nullable=False)
    description = Column(Text, nullable=True)
    category = Column(String(50), nullable=True) # AI assigned category
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    account = relationship("Account", back_populates="transactions")
    fraud_alerts = relationship("FraudAlert", back_populates="transaction")
