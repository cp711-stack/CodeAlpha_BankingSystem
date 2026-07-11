<div align="center">

# 🏦 FinVerse

### AI-Powered Digital Banking Platform

[![Built with C++17](https://img.shields.io/badge/Core_Engine-C++17-00599C?style=for-the-badge&logo=cplusplus)](CodeAlpha_BankingSystem/)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?style=for-the-badge&logo=fastapi)](backend/)
[![Next.js](https://img.shields.io/badge/Frontend-Next.js_14-000000?style=for-the-badge&logo=next.js)](frontend/)
[![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL_16-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](database/)
[![Docker](https://img.shields.io/badge/Deploy-Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)](docker-compose.yml)

*A full-stack fintech platform built on top of a C++ banking engine, featuring AI-powered analytics, fraud detection, and a modern dashboard.*

[Architecture](#architecture) · [Features](#features) · [Quick Start](#quick-start) · [API Docs](docs/api-reference.md) · [Resume Impact](docs/resume-bullets.md)

</div>

---

## 🎯 Overview

**FinVerse** transforms a console-based C++ Banking Management System (built during the CodeAlpha internship) into a production-grade digital banking platform. The original C++ engine is preserved as the core business logic layer, wrapped by a modern Python/FastAPI backend and served through a Next.js dashboard with AI-powered financial analytics.

### What makes this project stand out

| Dimension | Implementation |
|-----------|---------------|
| **Systems Programming** | C++17 core engine with custom exception hierarchy, atomic transactions, and STL-driven O(1) lookups |
| **Cross-Language Integration** | C++ ↔ Python interop via JSON bridge — demonstrating real-world legacy system integration |
| **Full-Stack Development** | Next.js 14 + TypeScript frontend, FastAPI async backend, PostgreSQL database — 3-tier architecture |
| **AI/ML Engineering** | 5 ML modules: NLP expense categorizer, Isolation Forest fraud detector, multi-factor health scorer |
| **Database Design** | 7 normalized tables, 10+ indexes, ACID transactions, analytical query optimization |
| **Security Engineering** | JWT auth with refresh tokens, bcrypt hashing, RBAC, input validation |
| **DevOps** | Docker Compose for one-command deployment, CI/CD ready |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                    Frontend (Next.js 14 + TypeScript)                │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ │
│  │  Auth    │ │Dashboard │ │Analytics │ │  Admin   │ │  EMI     │ │
│  │  Pages   │ │  Views   │ │  Charts  │ │  Panel   │ │  Calc    │ │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘ │
└────────────────────────────┬────────────────────────────────────────┘
                             │ REST API (HTTPS)
┌────────────────────────────┴────────────────────────────────────────┐
│                    Backend (FastAPI + Python)                        │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐              │
│  │JWT Auth  │ │ Banking  │ │Analytics │ │   AI     │              │
│  │Middleware│ │ Service  │ │ Service  │ │ Modules  │              │
│  └──────────┘ └─────┬────┘ └──────────┘ └──────────┘              │
└─────────────────────┼──────────────┬────────────────────────────────┘
                      │ subprocess   │ SQLAlchemy (async)
              ┌───────┴───────┐ ┌────┴─────┐
              │  C++ Engine   │ │PostgreSQL│
              │ (Bank Class)  │ │ 7 Tables │
              └───────────────┘ └──────────┘
```

> 📖 See [docs/architecture.md](docs/architecture.md) for detailed Mermaid diagrams including auth flow, transaction processing, and AI pipeline.

---

## ✨ Features

### Customer Dashboard
- 📊 **Account Dashboard** — Real-time balance cards with sparkline charts
- 💸 **Fund Transfers** — Atomic transfers with automatic rollback on failure
- 📜 **Transaction History** — Filterable, paginated with category tags
- 📄 **Account Statements** — Formatted, printable statements
- 🧮 **EMI Calculator** — Interactive loan calculator with amortization charts
- 📈 **Spending Analytics** — Category breakdown, monthly trends, MoM comparison
- ❤️ **Financial Health Score** — AI-powered 0–100 score with personalized recommendations
- 🔔 **Expense Categorization** — Automatic AI categorization of transactions

### Admin Panel
- 👥 **Customer Management** — Search, view, edit customer profiles
- 🏦 **Account Management** — Freeze/unfreeze, status monitoring
- 🛡️ **Fraud Detection** — Risk-scored alerts with review workflow
- 📊 **Banking Analytics** — System-wide metrics and growth charts

### AI/ML Modules
| Module | Approach | Purpose |
|--------|----------|---------|
| **Expense Categorizer** | TF-IDF + Keyword Matching | Auto-classify transactions into 10 categories |
| **Spending Analyzer** | Time-series aggregation | Monthly trends, MoM changes, outlier detection |
| **Financial Health Scorer** | Weighted multi-factor model | 0–100 score based on savings, volatility, diversity, growth |
| **Fraud Detector** | Isolation Forest + Rules | Velocity checks, amount anomaly, rapid drain detection |
| **Savings Recommender** | Rule-based engine | Personalized financial tips based on spending patterns |

---

## 🚀 Quick Start

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) & Docker Compose
- [Node.js 18+](https://nodejs.org/) (for frontend development)
- [Python 3.11+](https://www.python.org/) (for backend development)
- C++17 compiler (for the core engine)

### Option 1 — Docker (Recommended)

```bash
# Clone the repository
git clone https://github.com/your-username/finverse.git
cd finverse

# Start all services (PostgreSQL + FastAPI + Next.js)
docker-compose up -d

# The app is now running:
# Frontend:  http://localhost:3000
# Backend:   http://localhost:8000
# API Docs:  http://localhost:8000/docs
# Database:  localhost:5432
```

### Option 2 — Manual Setup

```bash
# 1. Start PostgreSQL (install separately or use Docker)
docker-compose up -d db

# 2. Backend
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000

# 3. Frontend
cd frontend
npm install
npm run dev

# 4. C++ Engine (optional — for bridge testing)
cd CodeAlpha_BankingSystem
make -f Makefile.bridge
echo '{"command": "calculate_emi", "principal": 100000, "annual_rate": 8.5, "tenure_months": 24}' | ./finverse_bridge
```

### Default Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@finverse.io | admin123 |
| Demo Customer | aarav@example.com | password123 |

---

## 📁 Project Structure

```
FinVerse/
├── CodeAlpha_BankingSystem/       # ★ Original C++ Engine (PRESERVED)
│   ├── include/                   #   Headers: Account, Customer, Bank, etc.
│   ├── src/                       #   Implementation + JSON bridge
│   ├── Makefile                   #   Original build (untouched)
│   └── Makefile.bridge            #   Bridge build (new)
│
├── backend/                       # ★ FastAPI Backend
│   └── app/
│       ├── routers/               #   API endpoint handlers
│       ├── models/                #   SQLAlchemy ORM models
│       ├── schemas/               #   Pydantic request/response schemas
│       ├── services/              #   Business logic layer
│       ├── middleware/            #   JWT auth + RBAC
│       ├── ai/                    #   AI/ML modules
│       └── main.py               #   FastAPI application
│
├── frontend/                      # ★ Next.js Dashboard
│   └── src/
│       ├── app/                   #   Pages (App Router)
│       ├── components/            #   UI + chart components
│       └── lib/                   #   API client, types, utilities
│
├── database/                      # ★ PostgreSQL
│   ├── schema.sql                 #   DDL (7 tables)
│   └── seed.sql                   #   Demo data (50+ transactions)
│
├── docs/                          # ★ Documentation
│   ├── architecture.md            #   System design + Mermaid diagrams
│   ├── api-reference.md           #   Full API documentation
│   ├── uml-diagrams.md           #   Class diagrams
│   └── resume-bullets.md         #   Resume-ready descriptions
│
├── docker-compose.yml             # One-command deployment
└── README.md                      # This file
```

---

## 📊 Database Schema

7 normalized tables with 10+ indexes:

| Table | Purpose | Key Columns |
|-------|---------|-------------|
| `customers` | User profiles + auth | id, name, email, password_hash, role |
| `accounts` | Bank accounts | account_number, type, balance, status |
| `transactions` | Immutable ledger | id, type, amount, balance_after, category |
| `expense_categories` | AI category labels | name, icon, color |
| `spending_patterns` | Monthly aggregations | customer_id, month, category, total |
| `financial_health_scores` | Health score history | score, savings_ratio, volatility |
| `fraud_alerts` | Fraud detection alerts | risk_score, alert_type, status |

> 📖 See [docs/architecture.md](docs/architecture.md) for the full ERD diagram.

---

## 🔒 Security

- **Password Storage**: bcrypt with salt (replaces the C++ engine's `std::hash`)
- **Authentication**: JWT with short-lived access tokens (30min) + long-lived refresh tokens (7d)
- **Authorization**: Role-based access control — `customer` and `admin` roles enforced at middleware level
- **Input Validation**: Pydantic schemas validate every request; C++ engine validates business rules
- **SQL Injection**: Parameterized queries via SQLAlchemy ORM
- **CORS**: Configurable allowed origins

---

## 🧪 Testing

```bash
# C++ engine (sanitizer-verified)
cd CodeAlpha_BankingSystem
g++ -std=c++17 -fsanitize=address,undefined -Iinclude src/*.cpp -o bankapp_test
./bankapp_test

# Python backend
cd backend
pytest tests/ -v

# Frontend
cd frontend
npm test
```

---

## 🗺️ Roadmap

- [x] Phase 1: C++ core banking engine
- [x] Phase 2: PostgreSQL schema + Docker setup
- [x] Phase 3: FastAPI backend with JWT auth
- [x] Phase 4: Next.js dashboard with analytics
- [x] Phase 5: AI/ML modules (categorization, fraud, health score)
- [ ] Phase 6: WebSocket real-time notifications
- [ ] Phase 7: Mobile app (React Native)
- [ ] Phase 8: Kubernetes deployment
- [ ] Phase 9: Event sourcing + CQRS

---

## 📄 Documentation

| Document | Description |
|----------|-------------|
| [Architecture](docs/architecture.md) | System design, data flow, Mermaid diagrams |
| [API Reference](docs/api-reference.md) | All 25+ endpoints with examples |
| [UML Diagrams](docs/uml-diagrams.md) | Class diagrams for C++ and Python layers |
| [Database Schema](database/schema.sql) | PostgreSQL DDL with comments |
| [Resume Bullets](docs/resume-bullets.md) | Role-specific resume descriptions |

---

## 🛠️ Tech Stack

| Layer | Technologies |
|-------|-------------|
| **Core Engine** | C++17, STL (unordered_map, map, vector) |
| **Backend** | Python 3.11, FastAPI, SQLAlchemy 2.0, Pydantic v2 |
| **Frontend** | Next.js 14, TypeScript, TailwindCSS, Recharts |
| **Database** | PostgreSQL 16 |
| **AI/ML** | scikit-learn, pandas, numpy |
| **Auth** | JWT (python-jose), bcrypt (passlib) |
| **DevOps** | Docker, Docker Compose |

---

## 📝 License

This project is licensed under the [MIT License](CodeAlpha_BankingSystem/LICENSE).

---

<div align="center">

**Built with ❤️ as a portfolio project — transforming a CodeAlpha internship deliverable into a production-grade fintech platform.**

</div>
