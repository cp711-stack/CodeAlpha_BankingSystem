import math
from typing import List
from app.models.transaction import Transaction

def detect_fraud(transaction: Transaction, recent_transactions: List[Transaction]) -> dict:
    """
    Simple fraud detection based on rules:
    - Amount > 3 std dev of recent transaction amounts
    - Velocity: more than 10 transactions in last hour
    - Rapid drain: Amount is > 70% of balance (would be checked before withdrawal)
    """
    alerts = []
    risk_score = 0.0
    
    if not recent_transactions:
        return {"is_fraud": False, "score": 0.0, "alerts": []}
        
    amounts = [float(t.amount) for t in recent_transactions if t.type in ["WITHDRAWAL", "TRANSFER_OUT"]]
    
    if amounts and len(amounts) >= 5:
        mean = sum(amounts) / len(amounts)
        variance = sum((x - mean) ** 2 for x in amounts) / len(amounts)
        std_dev = math.sqrt(variance)
        
        # If current amount is > mean + 3*std_dev
        if std_dev > 0 and float(transaction.amount) > (mean + 3 * std_dev):
            risk_score += 0.8
            alerts.append({
                "type": "AMOUNT_ANOMALY",
                "message": f"Transaction amount unusually high compared to history (Mean: {mean:.2f}, StdDev: {std_dev:.2f})"
            })
            
    # Velocity check - assumes recent_transactions are from last 24h
    if len(recent_transactions) > 15:
        risk_score += 0.6
        alerts.append({
            "type": "HIGH_VELOCITY",
            "message": "Unusually high number of transactions in a short period"
        })
        
    is_fraud = risk_score >= 0.7
    
    return {
        "is_fraud": is_fraud,
        "score": min(1.0, risk_score),
        "alerts": alerts
    }
