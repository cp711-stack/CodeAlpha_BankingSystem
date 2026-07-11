import re

def categorize_expense(description: str) -> str:
    if not description:
        return "Other"
        
    desc = description.lower()
    
    categories = {
        "Food & Dining": ["restaurant", "cafe", "coffee", "food", "swiggy", "zomato", "mcdonalds", "dominos", "pizza", "burger", "grocery", "supermarket"],
        "Transport": ["uber", "ola", "taxi", "cab", "metro", "train", "flight", "petrol", "fuel", "gas", "bus"],
        "Bills & Utilities": ["electricity", "water", "internet", "wifi", "broadband", "mobile", "recharge", "bill", "subscription", "netflix", "prime", "spotify"],
        "Shopping": ["amazon", "flipkart", "myntra", "clothes", "shoes", "electronics", "mall", "store"],
        "Entertainment": ["movie", "cinema", "pvr", "inox", "game", "bookmyshow", "concert", "event"],
        "Healthcare": ["hospital", "clinic", "pharmacy", "medicine", "doctor", "health", "apollo"],
        "Education": ["school", "college", "tuition", "course", "udemy", "coursera", "book", "stationery"],
        "Salary & Income": ["salary", "payroll", "dividend", "interest", "bonus", "refund"],
        "Transfers": ["transfer", "sent", "upi", "paytm", "phonepe", "gpay", "neft", "rtgs", "imps"]
    }
    
    for category, keywords in categories.items():
        for keyword in keywords:
            if re.search(r'\b' + keyword + r'\b', desc):
                return category
                
    return "Other"
