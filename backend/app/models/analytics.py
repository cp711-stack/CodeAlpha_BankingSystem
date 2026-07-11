from sqlalchemy import Column, String, Numeric, DateTime, ForeignKey, Integer, Date, func
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship
from app.database import Base

class ExpenseCategory(Base):
    __tablename__ = "expense_categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), unique=True, nullable=False)
    icon = Column(String(50), nullable=True)
    color = Column(String(20), nullable=True)

class SpendingPattern(Base):
    __tablename__ = "spending_patterns"

    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(String(50), ForeignKey("customers.id", ondelete="CASCADE"), nullable=False)
    month = Column(Date, nullable=False)
    category = Column(String(50), nullable=False)
    total_amount = Column(Numeric(15, 2), nullable=False, default=0.00)
    transaction_count = Column(Integer, nullable=False, default=0)

    # Relationships
    customer = relationship("Customer", back_populates="spending_patterns")

class FinancialHealthScore(Base):
    __tablename__ = "financial_health_scores"

    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(String(50), ForeignKey("customers.id", ondelete="CASCADE"), nullable=False)
    score = Column(Integer, nullable=False) # 0-100
    savings_ratio = Column(Numeric(5, 4), nullable=False)
    expense_volatility = Column(Numeric(5, 4), nullable=False)
    category_diversity = Column(Numeric(5, 4), nullable=False)
    balance_growth = Column(Numeric(5, 4), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    customer = relationship("Customer", back_populates="financial_health_scores")

class FraudAlert(Base):
    __tablename__ = "fraud_alerts"

    id = Column(Integer, primary_key=True, index=True)
    transaction_id = Column(String(50), ForeignKey("transactions.id", ondelete="CASCADE"), nullable=False)
    customer_id = Column(String(50), ForeignKey("customers.id", ondelete="CASCADE"), nullable=False)
    risk_score = Column(Numeric(5, 4), nullable=False)
    alert_type = Column(String(50), nullable=False)
    status = Column(String(20), default="PENDING", nullable=False)
    details = Column(JSONB, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    transaction = relationship("Transaction", back_populates="fraud_alerts")
    customer = relationship("Customer", back_populates="fraud_alerts")
