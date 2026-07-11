from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
import subprocess
import json

from app.database import get_db
from app.models.customer import Customer
from app.models.account import Account
from app.schemas.analytics import SpendingResponse, HealthScoreResponse, EMIRequest, EMIResponse
from app.middleware.auth import get_current_user
from app.services.analytics_service import get_spending_by_category
from app.ai.health_scorer import calculate_health_score
from app.ai.savings_recommender import generate_recommendations

router = APIRouter(prefix="/api/analytics", tags=["analytics"])

@router.get("/spending", response_model=SpendingResponse)
async def get_spending(
    customer_id: str = None, # type: ignore
    current_user: Customer = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    target_id = customer_id if (customer_id and current_user.role == "admin") else current_user.id
    return await get_spending_by_category(db, target_id)

@router.get("/health-score", response_model=HealthScoreResponse)
async def get_health_score(
    customer_id: str = None, # type: ignore
    current_user: Customer = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    target_id = customer_id if (customer_id and current_user.role == "admin") else current_user.id
    
    # Dynamically compute health score inputs
    spending_data = await get_spending_by_category(db, target_id)
    
    # Calculate Total Balance
    acc_result = await db.execute(select(Account).filter(Account.customer_id == target_id))
    accounts = acc_result.scalars().all()
    total_balance = float(sum(acc.balance for acc in accounts))
    
    total_spent = float(spending_data.total_spent)
    
    # Savings ratio: (Balance) / (Balance + Spent) - rough approximation
    savings_ratio = total_balance / (total_balance + total_spent) if (total_balance + total_spent) > 0 else 0.5
    
    # Category diversity: How spread out is the spending?
    # Max score 1.0 if many categories, 0.0 if all in one category.
    if len(spending_data.categories) > 0:
        max_cat = max(float(c.total) for c in spending_data.categories)
        category_diversity = 1.0 - (max_cat / total_spent) if total_spent > 0 else 0.0
    else:
        category_diversity = 0.5
        
    # Expense volatility & balance growth (simplified heuristics based on current data)
    expense_volatility = min(1.0, len(spending_data.categories) * 0.1)
    balance_growth = min(1.0, total_balance / 50000.0) if total_balance > 0 else 0.0
    
    health_data = calculate_health_score(
        savings_ratio=max(0.0, min(1.0, savings_ratio)),
        expense_volatility=max(0.0, min(1.0, expense_volatility)),
        category_diversity=max(0.0, min(1.0, category_diversity)),
        balance_growth=max(0.0, min(1.0, balance_growth))
    )
    
    spending_data = await get_spending_by_category(db, target_id)
    recommendations = generate_recommendations(health_data, spending_data.categories)
    
    return HealthScoreResponse(
        score=health_data["score"],
        grade=health_data["grade"],
        breakdown=health_data["breakdown"], # type: ignore
        recommendations=recommendations
    )

@router.post("/tools/emi", response_model=EMIResponse)
async def calculate_emi(request: EMIRequest):
    # Delegate to C++ engine via JSON bridge
    cmd = {
        "command": "calculate_emi",
        "principal": float(request.principal),
        "annual_rate": request.annual_rate,
        "tenure_months": request.tenure_months
    }
    
    try:
        # Assuming the C++ bridge is compiled and available in the CodeAlpha directory
        process = subprocess.run(
            ["../CodeAlpha_BankingSystem/finverse_bridge"],
            input=json.dumps(cmd),
            text=True,
            capture_output=True,
            check=True
        )
        
        result = json.loads(process.stdout)
        if result.get("success"):
            return EMIResponse(
                emi=result["emi"],
                total_payment=result["total_payment"],
                total_interest=result["total_interest"]
            )
        else:
            raise HTTPException(status_code=400, detail=result.get("error", "Failed to calculate EMI"))
            
    except (subprocess.CalledProcessError, FileNotFoundError) as e:
        # Fallback Python implementation if bridge is not available
        r = (request.annual_rate / 12) / 100
        if r == 0:
            emi = request.principal / request.tenure_months
        else:
            factor = (1 + r) ** request.tenure_months
            emi = float(request.principal) * r * factor / (factor - 1)
            
        total_payment = emi * request.tenure_months
        total_interest = total_payment - float(request.principal)
        
        return EMIResponse(
            emi=round(emi, 2), # type: ignore
            total_payment=round(total_payment, 2), # type: ignore
            total_interest=round(total_interest, 2) # type: ignore
        )
