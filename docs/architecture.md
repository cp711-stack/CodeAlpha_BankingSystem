# FinVerse — System Architecture

## High-Level Architecture

```mermaid
graph TB
    subgraph "Frontend — Next.js 14 + TypeScript"
        A["🏠 Customer Dashboard"]
        B["🔐 Auth Pages"]
        C["📊 Analytics & Charts"]
        D["🛡️ Admin Dashboard"]
    end

    subgraph "API Gateway — FastAPI"
        E["Auth Router<br>JWT + RBAC"]
        F["Banking Router<br>Accounts, Transactions"]
        G["Analytics Router<br>Spending, Health Score"]
        H["Admin Router<br>Management, Monitoring"]
        I["AI Router<br>Categorization, Fraud"]
    end

    subgraph "Core Banking Engine — C++ 17"
        J["Bank Class<br>Orchestration Layer"]
        K["Account / Transaction<br>Domain Models"]
        L["EMI Calculator<br>Financial Math"]
        M["Exception Hierarchy<br>Business Rule Enforcement"]
    end

    subgraph "AI/ML Module — Python"
        N["Expense Categorizer<br>TF-IDF + NB"]
        O["Spending Analyzer<br>Time-Series"]
        P["Health Scorer<br>Multi-Factor"]
        Q["Fraud Detector<br>Isolation Forest"]
        R["Savings Recommender<br>Rule Engine"]
    end

    subgraph "Data Layer"
        S[("PostgreSQL 16<br>7 Tables + Indexes")]
    end

    A & B & C & D -->|"HTTPS / REST"| E & F & G & H & I
    F -->|"subprocess<br>JSON bridge"| J
    J --> K & L & M
    G & I --> N & O & P & Q & R
    F & G & H -->|"SQLAlchemy<br>async"| S
    N & O & P & Q & R -->|"Read"| S
```

## Layer Responsibility Matrix

| Layer | Technology | Responsibility | Deployed As |
|-------|-----------|----------------|-------------|
| **Presentation** | Next.js 14, TypeScript, TailwindCSS, Recharts | User interface, data visualization, client-side routing | Docker container (port 3000) |
| **API Gateway** | FastAPI, Pydantic | Request validation, JWT auth, RBAC, rate limiting | Docker container (port 8000) |
| **Business Logic** | Python services + C++ engine | Banking rules, transaction processing, EMI calculation | Embedded in API container |
| **AI/ML** | scikit-learn, pandas, numpy | Expense categorization, fraud detection, health scoring | Embedded in API container |
| **Persistence** | PostgreSQL 16, SQLAlchemy 2.0 | ACID transactions, analytical queries, data integrity | Docker container (port 5432) |

## Authentication Flow

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant A as FastAPI
    participant DB as PostgreSQL

    U->>F: Enter email + password
    F->>A: POST /api/auth/login
    A->>DB: SELECT customer WHERE email = ?
    DB-->>A: Customer record
    A->>A: bcrypt.verify(password, hash)
    A->>A: Generate JWT (access + refresh)
    A-->>F: {access_token, refresh_token, customer}
    F->>F: Store tokens in localStorage
    F-->>U: Redirect to /dashboard

    Note over F,A: Subsequent requests
    F->>A: GET /api/accounts (Bearer token)
    A->>A: Verify JWT, extract customer_id
    A->>DB: SELECT * FROM accounts WHERE customer_id = ?
    DB-->>A: Account records
    A-->>F: [Account, Account, ...]
```

## Transaction Processing Flow

```mermaid
sequenceDiagram
    participant F as Frontend
    participant A as FastAPI
    participant S as Banking Service
    participant DB as PostgreSQL
    participant AI as Fraud Detector

    F->>A: POST /api/transactions/transfer
    A->>A: Validate JWT, extract user
    A->>S: transfer(from, to, amount)
    S->>DB: BEGIN TRANSACTION
    S->>DB: SELECT account WHERE id = from_acc (FOR UPDATE)
    S->>S: Validate: active, sufficient funds, min balance
    S->>DB: UPDATE balance (debit from_acc)
    S->>DB: SELECT account WHERE id = to_acc (FOR UPDATE)
    S->>DB: UPDATE balance (credit to_acc)
    S->>DB: INSERT transaction (TRANSFER_OUT)
    S->>DB: INSERT transaction (TRANSFER_IN)
    S->>AI: analyze_transaction(txn)
    AI->>AI: Velocity check, amount anomaly
    alt Fraud detected
        AI->>DB: INSERT fraud_alert
    end
    S->>DB: COMMIT
    S-->>A: Success + updated balances
    A-->>F: 200 OK
```

## C++ Integration Architecture

```mermaid
graph LR
    subgraph "Python Process (FastAPI)"
        A[Banking Service] -->|subprocess.run| B[finverse_bridge]
    end

    subgraph "C++ Process"
        B -->|stdin: JSON| C[Bridge Main]
        C --> D[Bank::calculateEMI]
        C --> E[Utils::isValidAmount]
        C --> F[Utils::roundTo2]
        D -->|stdout: JSON| A
    end

    style B fill:#f59e0b,stroke:#d97706,color:#000
    style C fill:#3b82f6,stroke:#2563eb,color:#fff
```

The C++ bridge (`finverse_bridge`) is a standalone executable that:
1. Reads a JSON command from stdin
2. Delegates to the existing C++ `Bank` class methods
3. Returns a JSON response to stdout

This preserves the original C++ codebase untouched while enabling Python interop.

## Database Schema (ERD)

```mermaid
erDiagram
    customers ||--o{ accounts : "has"
    customers ||--o{ spending_patterns : "tracked_for"
    customers ||--o{ financial_health_scores : "scored"
    customers ||--o{ fraud_alerts : "flagged_on"
    accounts ||--o{ transactions : "records"
    transactions ||--o{ fraud_alerts : "triggers"

    customers {
        varchar id PK "CUST00001"
        varchar name
        text address
        varchar phone
        varchar email UK
        varchar password_hash
        varchar role "customer|admin"
        boolean is_active
        timestamptz created_at
    }

    accounts {
        varchar account_number PK "AC0000001"
        varchar customer_id FK
        varchar type "SAVINGS|CURRENT"
        decimal balance
        varchar status "ACTIVE|FROZEN|CLOSED"
        timestamptz created_at
    }

    transactions {
        varchar id PK "TXN00000001"
        varchar account_number FK
        varchar type "DEPOSIT|WITHDRAWAL|..."
        decimal amount
        decimal balance_after
        text description
        varchar category "AI-assigned"
        timestamptz created_at
    }

    expense_categories {
        serial id PK
        varchar name UK
        varchar icon
        varchar color
    }

    spending_patterns {
        serial id PK
        varchar customer_id FK
        date month
        varchar category
        decimal total_amount
        int transaction_count
    }

    financial_health_scores {
        serial id PK
        varchar customer_id FK
        int score "0-100"
        decimal savings_ratio
        decimal expense_volatility
        decimal category_diversity
        decimal balance_growth
    }

    fraud_alerts {
        serial id PK
        varchar transaction_id FK
        varchar customer_id FK
        decimal risk_score
        varchar alert_type
        varchar status
        jsonb details
    }
```

## AI/ML Pipeline Architecture

```mermaid
graph TD
    subgraph "Data Ingestion"
        A[New Transaction] --> B{Expense Categorizer}
        B -->|Category Label| C[(transactions.category)]
    end

    subgraph "Batch Analytics (Scheduled)"
        C --> D[Spending Analyzer]
        D --> E[(spending_patterns)]
        E --> F[Health Scorer]
        F --> G[(financial_health_scores)]
        E --> H[Savings Recommender]
        H --> I[Personalized Tips]
    end

    subgraph "Real-Time Detection"
        A --> J[Fraud Detector]
        J -->|Risk Score > 0.7| K[(fraud_alerts)]
        J -->|Velocity Check| K
        J -->|Amount Anomaly| K
        J -->|Rapid Drain| K
    end
```
