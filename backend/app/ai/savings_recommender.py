def generate_recommendations(health_data: dict, categories: list) -> list:
    recommendations = []
    
    score = health_data.get("score", 0)
    breakdown = health_data.get("breakdown", {})
    
    if score < 50:
        recommendations.append("Your financial health score is low. Focus on reducing unnecessary expenses and building an emergency fund.")
        
    if breakdown.get("savings_ratio", 0) < 0.2:
        recommendations.append("Aim to save at least 20% of your income. Currently, your savings ratio is below the recommended threshold.")
    else:
        recommendations.append("Great job maintaining a healthy savings ratio! Consider investing your surplus in a Fixed Deposit or Mutual Funds.")
        
    # Analyze categories
    if categories:
        top_category = categories[0]
        if top_category.percentage > 40 and top_category.category != "Transfers":
            recommendations.append(f"Your spending is heavily concentrated in '{top_category.category}' ({top_category.percentage}%). Consider setting a budget for this category.")
            
        dining = next((c for c in categories if c.category == "Food & Dining"), None)
        if dining and dining.percentage > 30:
            recommendations.append("Your dining and food expenses are quite high. Cooking at home more often could help you save significantly.")
            
    return recommendations
