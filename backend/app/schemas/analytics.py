from pydantic import BaseModel
from typing import List, Dict, Optional
from datetime import datetime
from decimal import Decimal

class SpendingCategory(BaseModel):
    category: str
    total: Decimal
    count: int
    percentage: float

class SpendingResponse(BaseModel):
    categories: List[SpendingCategory]
    total_spent: Decimal
    month: str

class HealthScoreBreakdown(BaseModel):
    savings_ratio: float
    expense_volatility: float
    category_diversity: float
    balance_growth: float

class HealthScoreResponse(BaseModel):
    score: int
    grade: str
    breakdown: HealthScoreBreakdown
    recommendations: List[str]

class FraudAlertResponse(BaseModel):
    id: int
    transaction_id: str
    customer_id: str
    risk_score: float
    alert_type: str
    status: str
    details: Optional[dict] = None
    created_at: datetime

    model_config = {"from_attributes": True}

class EMIRequest(BaseModel):
    principal: Decimal
    annual_rate: float
    tenure_months: int

class EMIResponse(BaseModel):
    emi: Decimal
    total_payment: Decimal
    total_interest: Decimal
