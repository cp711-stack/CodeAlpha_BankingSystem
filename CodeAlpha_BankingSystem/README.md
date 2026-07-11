# CodeAlpha Banking Management System

A console-based, enterprise-style **Banking Management System** written in modern **C++17**, built to demonstrate solid **Object-Oriented Design**, layered architecture, robust exception handling, and file-based persistence — without any external dependencies.

> Built as part of the CodeAlpha C++ Internship program.

---

## Features

- **Role-based access** — separate menus and permissions for **Admin** and **Customer**
- **Customer self-service**: registration, login, profile updates
- **Account lifecycle**: open (Savings/Current), freeze/unfreeze, close accounts
- **Core banking operations**: deposit, withdrawal, and inter-account **fund transfer** (with automatic rollback on partial failure)
- **Transaction ledger**: every operation is recorded and retrievable per account
- **Account statement generation** — formatted, printable statement of an account's activity
- **Loan EMI calculator** — reducing-balance EMI formula with total interest/payment breakdown
- **Persistent storage** — all data survives restarts via flat files (`data/*.dat`), no database required
- **Custom exception hierarchy** — every business rule violation (insufficient funds, invalid amount, duplicate account, auth failure, etc.) throws a specific, catchable exception; the app never crashes on bad input
- **STL-driven design** — `unordered_map` for O(1) customer/account lookups, `map` for ordered transaction ledgers, `vector` for collections
- **Modular architecture** — clean separation between `include/` (headers) and `src/` (implementation), one class per file

---

## Architecture

```
CodeAlpha_BankingSystem/
├── include/                 # Public headers (class interfaces)
│   ├── Exceptions.h          # Custom exception hierarchy
│   ├── Utils.h                # Shared helpers (IDs, timestamps, parsing, I/O)
│   ├── Transaction.h          # Immutable ledger entry
│   ├── Account.h              # Bank account (Savings / Current)
│   ├── Customer.h             # Customer profile + owned accounts
│   ├── Admin.h                # Admin credentials & authentication
│   └── Bank.h                 # Orchestration layer: business rules + persistence
├── src/                      # Implementation files
│   ├── Utils.cpp
│   ├── Transaction.cpp
│   ├── Account.cpp
│   ├── Customer.cpp
│   ├── Admin.cpp
│   ├── Bank.cpp
│   └── main.cpp                # Menu-driven console UI (presentation layer only)
├── data/                     # Flat-file persistent storage (created at runtime)
├── Makefile                  # Build via GNU Make
├── CMakeLists.txt            # Build via CMake (alternative)
├── LICENSE
└── README.md
```

### Design overview

| Layer | Responsibility |
|---|---|
| `Transaction` | An immutable record of a single monetary movement. |
| `Account` | Owns a balance and enforces account-level invariants (minimum savings balance, frozen/closed state) via `credit()` / `debit()`. |
| `Customer` | A profile plus the list of account numbers it owns. Password is stored as a hash, never in plaintext. |
| `Admin` | A single privileged role for bank-wide operations. |
| `Bank` | The **only** class that touches all the containers. It generates IDs, enforces cross-cutting business rules (e.g. "a transfer's debit and credit must be atomic"), and mirrors in-memory state to disk after every mutating operation. |
| `main.cpp` | Pure presentation/input-handling. Every operation is wrapped in `try { ... } catch (const BankException&)` so the UI degrades gracefully instead of crashing. |

This keeps the UI, business rules, and data model independently testable and swappable (e.g. `main.cpp` could be replaced with a GUI or REST layer without touching `Bank`'s logic).

### Exception hierarchy

```
std::exception
└── BankException
    ├── AccountNotFoundException
    ├── CustomerNotFoundException
    ├── InsufficientFundsException
    ├── InvalidAmountException
    ├── AuthenticationException
    ├── DuplicateAccountException
    ├── InvalidOperationException
    └── FileIOException
```

Every method in `Bank` that can fail throws a specific exception rather than returning error codes or booleans — callers catch `BankException&` for a blanket handler, or a specific subtype when they need to react differently.

### Data persistence format

Data is stored in simple pipe-delimited (`|`) flat files under `data/`, one record per line — easy to inspect, diff, or migrate to a real database later:

```
# customers.dat
CUST00001|Alice Wonderland|123 Main St|9998887777|alice@example.com|<hash>|AC0000001,AC0000002

# accounts.dat
AC0000001|CUST00001|SAVINGS|1800.00|ACTIVE|2026-07-11 15:49:12

# transactions.dat
TXN00000001|AC0000001|DEPOSIT|2000.00|2000.00|2026-07-11 15:49:12|Initial deposit on account opening
```

> **Note on security**: passwords are hashed (not stored in plaintext), but the hash function used (`Utils::hashPassword`) is a simple, dependency-free hash chosen so the project builds anywhere with zero external libraries. **For real production use, swap it for bcrypt/argon2/PBKDF2.**

---

## Getting Started

### Prerequisites

- A C++17-capable compiler (GCC ≥ 7, Clang ≥ 5, or MSVC ≥ 2017)
- `make` (or `cmake` ≥ 3.10) — optional, you can also compile directly with `g++`

### Build & Run

**Option 1 — Make**
```bash
make          # builds ./bankapp
make run      # builds and runs
make clean    # removes build artifacts
```

**Option 2 — CMake**
```bash
mkdir build && cd build
cmake ..
cmake --build .
./bankapp
```

**Option 3 — Direct compile**
```bash
g++ -std=c++17 -Wall -Wextra -O2 -Iinclude src/*.cpp -o bankapp
./bankapp
```

### Default Admin Credentials

```
Username: admin
Password: admin123
```

> This is provisioned automatically on first run (see `Bank::loadData`). Change this in a real deployment.

---

## Usage Walkthrough

1. Run `./bankapp`.
2. **Register** as a new customer (option 2) — note the generated Customer ID (e.g. `CUST00001`).
3. **Log in** as that customer (option 1).
4. **Open an account** — Savings requires a minimum opening deposit of `500.00`.
5. Deposit, withdraw, or transfer funds between accounts.
6. View **transaction history** or generate a formatted **account statement**.
7. Try the **Loan EMI Calculator** (option 8) — enter principal, annual interest rate, and tenure in months.
8. Log out and sign in as **Admin** to view all customers/accounts, freeze/unfreeze accounts, or force-close accounts bank-wide.

---

## Key Business Rules Enforced

- Savings accounts require a **minimum opening deposit and running balance of 500.00**.
- An account **cannot be closed** unless its balance is exactly zero.
- Deposits/withdrawals are blocked on **frozen** or **closed** accounts.
- Fund transfers are **atomic**: if the credit leg fails after the debit leg succeeds, the debit is automatically rolled back so balances never drift.
- All monetary values are rounded to 2 decimal places to avoid floating-point drift accumulating across many transactions.

---

## Testing Notes

This project was manually verified end-to-end (registration → login → account creation → deposit/withdraw/transfer → statements → EMI calculator → admin views → error paths for insufficient funds, wrong passwords, and premature account closure) and additionally compiled and exercised under **AddressSanitizer + UndefinedBehaviorSanitizer** with zero warnings or errors.

---

## Possible Future Enhancements

- Replace the flat-file store with SQLite/PostgreSQL
- Multi-admin support with role-based permissions (RBAC)
- Interest accrual scheduling for savings accounts
- REST API layer (e.g. via a lightweight C++ HTTP framework) on top of the existing `Bank` class
- Unit tests (GoogleTest/Catch2) covering `Bank`, `Account`, and EMI calculation logic
- Replace the demo password hash with bcrypt/argon2

---

## License

This project is licensed under the [MIT License](LICENSE).

---

## Author

Built as part of the **CodeAlpha C++ Programming Internship** — Task: Banking Management System.
