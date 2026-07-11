# FinVerse — API Reference

## Base URL

```
http://localhost:8000
```

All endpoints return JSON. Authentication uses JWT Bearer tokens.

---

## Authentication

### Register

```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "Aarav Sharma",
  "email": "aarav@example.com",
  "phone": "9876543210",
  "address": "42 MG Road, Bengaluru",
  "password": "securepassword123"
}
```

**Response** `201 Created`:
```json
{
  "access_token": "eyJhbGciOi...",
  "refresh_token": "eyJhbGciOi...",
  "token_type": "bearer",
  "customer": {
    "id": "CUST00001",
    "name": "Aarav Sharma",
    "email": "aarav@example.com",
    "phone": "9876543210",
    "address": "42 MG Road, Bengaluru",
    "role": "customer",
    "is_active": true,
    "created_at": "2026-07-11T16:00:00Z"
  }
}
```

### Login

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "aarav@example.com",
  "password": "securepassword123"
}
```

**Response** `200 OK`: Same schema as Register response.

### Refresh Token

```http
POST /api/auth/refresh
Content-Type: application/json

{
  "refresh_token": "eyJhbGciOi..."
}
```

**Response** `200 OK`:
```json
{
  "access_token": "eyJhbGciOi...",
  "token_type": "bearer"
}
```

---

## Customer Profile

> All endpoints below require: `Authorization: Bearer <access_token>`

### Get My Profile

```http
GET /api/customers/me
```

**Response** `200 OK`:
```json
{
  "id": "CUST00001",
  "name": "Aarav Sharma",
  "email": "aarav@example.com",
  "phone": "9876543210",
  "address": "42 MG Road, Bengaluru",
  "role": "customer",
  "is_active": true,
  "created_at": "2026-07-11T16:00:00Z",
  "updated_at": "2026-07-11T16:00:00Z"
}
```

### Update My Profile

```http
PATCH /api/customers/me
Content-Type: application/json

{
  "name": "Aarav K. Sharma",
  "phone": "9876543999"
}
```

---

## Accounts

### List My Accounts

```http
GET /api/accounts
```

**Response** `200 OK`:
```json
[
  {
    "account_number": "AC0000001",
    "customer_id": "CUST00001",
    "type": "SAVINGS",
    "balance": 45750.00,
    "status": "ACTIVE",
    "created_at": "2026-07-11T16:00:00Z"
  }
]
```

### Create Account

```http
POST /api/accounts
Content-Type: application/json

{
  "type": "SAVINGS",
  "initial_deposit": 5000.00
}
```

**Business Rules**:
- Savings accounts require minimum ₹500.00 opening deposit
- Current accounts can be opened with ₹0.00

### Get Account Details

```http
GET /api/accounts/{account_number}
```

### Get Account Statement

```http
GET /api/accounts/{account_number}/statement
```

**Response** `200 OK`:
```json
{
  "account": { ... },
  "transactions": [ ... ],
  "summary": {
    "total_deposits": 100000.00,
    "total_withdrawals": 54250.00,
    "opening_balance": 0.00,
    "closing_balance": 45750.00
  }
}
```

---

## Transactions

### Deposit

```http
POST /api/transactions/deposit
Content-Type: application/json

{
  "account_number": "AC0000001",
  "amount": 5000.00
}
```

**Business Rules**:
- Amount must be positive and finite
- Account must be ACTIVE (not FROZEN or CLOSED)

### Withdraw

```http
POST /api/transactions/withdraw
Content-Type: application/json

{
  "account_number": "AC0000001",
  "amount": 1000.00
}
```

**Business Rules**:
- Savings accounts must maintain minimum balance of ₹500.00
- Amount must be positive and not exceed available balance

### Transfer

```http
POST /api/transactions/transfer
Content-Type: application/json

{
  "from_account": "AC0000001",
  "to_account": "AC0000002",
  "amount": 5000.00
}
```

**Business Rules**:
- Cannot transfer to the same account
- Atomic: if credit fails, debit is rolled back
- Both accounts must be ACTIVE

### Get Transaction History

```http
GET /api/transactions/{account_number}
```

---

## Analytics

### Spending Breakdown

```http
GET /api/analytics/spending?customer_id=CUST00001
```

**Response** `200 OK`:
```json
{
  "categories": [
    {"category": "Food & Dining", "total": 5200.00, "count": 4, "percentage": 18.5},
    {"category": "Shopping", "total": 8900.00, "count": 2, "percentage": 31.7}
  ],
  "total_spent": 28100.00,
  "month": "2026-07"
}
```

### Financial Health Score

```http
GET /api/analytics/health-score?customer_id=CUST00001
```

**Response** `200 OK`:
```json
{
  "score": 72,
  "grade": "Good",
  "breakdown": {
    "savings_ratio": 0.65,
    "expense_volatility": 0.78,
    "category_diversity": 0.55,
    "balance_growth": 0.82
  },
  "recommendations": [
    "Your dining spend increased 40% this month — consider setting a budget",
    "You have consistent savings — consider a Fixed Deposit for higher returns"
  ]
}
```

### EMI Calculator

```http
POST /api/tools/emi
Content-Type: application/json

{
  "principal": 1000000.00,
  "annual_rate": 8.5,
  "tenure_months": 240
}
```

**Response** `200 OK`:
```json
{
  "emi": 8678.23,
  "total_payment": 2082775.20,
  "total_interest": 1082775.20
}
```

**Formula**: Reducing-balance EMI = `P × r × (1+r)^n / ((1+r)^n - 1)` where `r = (annual_rate/12)/100`

---

## Admin Endpoints

> Require admin role in JWT claims.

### List All Customers

```http
GET /api/admin/customers
```

### List All Accounts

```http
GET /api/admin/accounts
```

### Freeze Account

```http
PATCH /api/admin/accounts/{account_number}/freeze
```

### Unfreeze Account

```http
PATCH /api/admin/accounts/{account_number}/unfreeze
```

### System Analytics Overview

```http
GET /api/admin/analytics/overview
```

**Response** `200 OK`:
```json
{
  "total_customers": 5,
  "total_accounts": 8,
  "total_deposits": 595000.00,
  "total_transactions": 51,
  "active_accounts": 7,
  "frozen_accounts": 1,
  "closed_accounts": 0
}
```

### Fraud Alerts

```http
GET /api/admin/fraud-alerts
```

**Response** `200 OK`:
```json
[
  {
    "id": 1,
    "transaction_id": "TXN00000010",
    "customer_id": "CUST00001",
    "risk_score": 0.85,
    "alert_type": "AMOUNT_ANOMALY",
    "status": "PENDING",
    "details": {"amount": 35000, "mean": 3500, "std_dev": 5000},
    "created_at": "2026-07-11T16:00:00Z"
  }
]
```

---

## Error Responses

All errors follow this format:

```json
{
  "detail": "Descriptive error message"
}
```

| Status Code | Meaning |
|-------------|---------|
| `400` | Bad Request — invalid input, business rule violation |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden — insufficient role (non-admin accessing admin endpoints) |
| `404` | Not Found — account/customer not found |
| `409` | Conflict — duplicate email on registration |
| `422` | Validation Error — Pydantic schema validation failed |
| `500` | Internal Server Error |
