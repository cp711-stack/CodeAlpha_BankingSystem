def calculate_health_score(savings_ratio: float, expense_volatility: float, category_diversity: float, balance_growth: float) -> dict:
    # savings_ratio(0.35), expense_volatility(0.25), category_diversity(0.20), balance_growth(0.20)
    score = (
        (savings_ratio * 100 * 0.35) + 
        ((1 - expense_volatility) * 100 * 0.25) + 
        (category_diversity * 100 * 0.20) + 
        (balance_growth * 100 * 0.20)
    )
    
    score = max(0, min(100, int(score)))
    
    if score >= 80:
        grade = "Excellent"
    elif score >= 60:
        grade = "Good"
    elif score >= 40:
        grade = "Fair"
    else:
        grade = "Poor"
        
    return {
        "score": score,
        "grade": grade,
        "breakdown": {
            "savings_ratio": round(savings_ratio, 2),
            "expense_volatility": round(expense_volatility, 2),
            "category_diversity": round(category_diversity, 2),
            "balance_growth": round(balance_growth, 2)
        }
    }
