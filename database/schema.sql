-- ============================================================================
-- FinVerse — AI-Powered Digital Banking Platform
-- PostgreSQL Database Schema
-- ============================================================================

-- Enable UUID extension for potential future use
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- CORE BANKING TABLES
-- ============================================================================

CREATE TABLE IF NOT EXISTS customers (
    id              VARCHAR(10) PRIMARY KEY,            -- CUST00001
    name            VARCHAR(100) NOT NULL,
    address         TEXT DEFAULT '',
    phone           VARCHAR(15) NOT NULL,
    email           VARCHAR(100) NOT NULL UNIQUE,
    password_hash   VARCHAR(255) NOT NULL,              -- bcrypt hash
    role            VARCHAR(10) NOT NULL DEFAULT 'customer'
                    CHECK (role IN ('customer', 'admin')),
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS accounts (
    account_number  VARCHAR(10) PRIMARY KEY,            -- AC0000001
    customer_id     VARCHAR(10) NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    type            VARCHAR(10) NOT NULL CHECK (type IN ('SAVINGS', 'CURRENT')),
    balance         DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    status          VARCHAR(10) NOT NULL DEFAULT 'ACTIVE'
                    CHECK (status IN ('ACTIVE', 'FROZEN', 'CLOSED')),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS transactions (
    id              VARCHAR(12) PRIMARY KEY,            -- TXN00000001
    account_number  VARCHAR(10) NOT NULL REFERENCES accounts(account_number) ON DELETE CASCADE,
    type            VARCHAR(15) NOT NULL
                    CHECK (type IN ('DEPOSIT', 'WITHDRAWAL', 'TRANSFER_IN', 'TRANSFER_OUT', 'LOAN_DISBURSAL')),
    amount          DECIMAL(15, 2) NOT NULL CHECK (amount > 0),
    balance_after   DECIMAL(15, 2) NOT NULL,
    description     TEXT DEFAULT '',
    category        VARCHAR(30) DEFAULT NULL,           -- AI-assigned expense category
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- AI / ANALYTICS TABLES
-- ============================================================================

CREATE TABLE IF NOT EXISTS expense_categories (
    id              SERIAL PRIMARY KEY,
    name            VARCHAR(30) NOT NULL UNIQUE,
    icon            VARCHAR(10) DEFAULT '📦',
    color           VARCHAR(7) DEFAULT '#6366f1'        -- hex color for UI
);

CREATE TABLE IF NOT EXISTS spending_patterns (
    id              SERIAL PRIMARY KEY,
    customer_id     VARCHAR(10) NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    month           DATE NOT NULL,                      -- first day of the month
    category        VARCHAR(30) NOT NULL,
    total_amount    DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    transaction_count INT NOT NULL DEFAULT 0,
    avg_amount      DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    UNIQUE(customer_id, month, category)
);

CREATE TABLE IF NOT EXISTS financial_health_scores (
    id              SERIAL PRIMARY KEY,
    customer_id     VARCHAR(10) NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    score           INT NOT NULL CHECK (score BETWEEN 0 AND 100),
    savings_ratio   DECIMAL(5, 4) DEFAULT 0.0,
    expense_volatility DECIMAL(5, 4) DEFAULT 0.0,
    category_diversity DECIMAL(5, 4) DEFAULT 0.0,
    balance_growth  DECIMAL(5, 4) DEFAULT 0.0,
    computed_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS fraud_alerts (
    id              SERIAL PRIMARY KEY,
    transaction_id  VARCHAR(12) REFERENCES transactions(id) ON DELETE SET NULL,
    customer_id     VARCHAR(10) NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    risk_score      DECIMAL(5, 4) NOT NULL DEFAULT 0.0,
    alert_type      VARCHAR(30) NOT NULL
                    CHECK (alert_type IN ('VELOCITY', 'AMOUNT_ANOMALY', 'PATTERN_DEVIATION', 'RAPID_DRAIN')),
    status          VARCHAR(15) NOT NULL DEFAULT 'PENDING'
                    CHECK (status IN ('PENDING', 'REVIEWED', 'CLEARED', 'CONFIRMED')),
    details         JSONB DEFAULT '{}',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_accounts_customer      ON accounts(customer_id);
CREATE INDEX IF NOT EXISTS idx_txn_account            ON transactions(account_number);
CREATE INDEX IF NOT EXISTS idx_txn_created            ON transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_txn_category           ON transactions(category);
CREATE INDEX IF NOT EXISTS idx_txn_type               ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_spending_cust_month    ON spending_patterns(customer_id, month);
CREATE INDEX IF NOT EXISTS idx_health_customer        ON financial_health_scores(customer_id);
CREATE INDEX IF NOT EXISTS idx_fraud_status           ON fraud_alerts(status);
CREATE INDEX IF NOT EXISTS idx_fraud_customer         ON fraud_alerts(customer_id);

-- ============================================================================
-- SEED: Default expense categories
-- ============================================================================

INSERT INTO expense_categories (name, icon, color) VALUES
    ('Food & Dining',    '🍔', '#ef4444'),
    ('Transport',        '🚗', '#f97316'),
    ('Bills & Utilities','💡', '#eab308'),
    ('Shopping',         '🛍️', '#22c55e'),
    ('Entertainment',    '🎬', '#3b82f6'),
    ('Healthcare',       '🏥', '#8b5cf6'),
    ('Education',        '📚', '#ec4899'),
    ('Salary & Income',  '💰', '#14b8a6'),
    ('Transfers',        '🔄', '#6366f1'),
    ('Other',            '📦', '#64748b')
ON CONFLICT (name) DO NOTHING;

-- ============================================================================
-- SEED: Default admin user (password: admin123, bcrypt hash)
-- ============================================================================

INSERT INTO customers (id, name, address, phone, email, password_hash, role)
VALUES (
    'ADMIN001',
    'System Administrator',
    'FinVerse HQ',
    '0000000000',
    'admin@finverse.io',
    '$2b$12$LJ3m4ys3Lz0YLfDpB.Wz5OqF8Nv6fRqPkSx4kH1sXzMxYvHqJXGS',  -- admin123
    'admin'
)
ON CONFLICT (id) DO NOTHING;
