from sqlalchemy import Column, String, Numeric, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship
from app.database import Base

class Account(Base):
    __tablename__ = "accounts"

    account_number = Column(String(50), primary_key=True, index=True)
    customer_id = Column(String(50), ForeignKey("customers.id", ondelete="CASCADE"), nullable=False)
    type = Column(String(20), nullable=False) # 'SAVINGS' or 'CURRENT'
    balance = Column(Numeric(15, 2), default=0.00, nullable=False)
    status = Column(String(20), default="ACTIVE", nullable=False) # 'ACTIVE', 'FROZEN', 'CLOSED'
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    customer = relationship("Customer", back_populates="accounts")
    transactions = relationship("Transaction", back_populates="account", cascade="all, delete-orphan")
