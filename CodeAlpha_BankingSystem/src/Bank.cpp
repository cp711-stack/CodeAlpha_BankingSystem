/**
 * @file Bank.cpp
 * @brief Implementation of the Bank orchestration layer.
 */
#include "Bank.h"
#include "Exceptions.h"
#include "Utils.h"

#include <fstream>
#include <sstream>
#include <iostream>
#include <iomanip>
#include <cmath>
#include <sys/stat.h>

namespace {
    // Cross-platform-ish "mkdir -p" for a single-level directory.
    void ensureDirectoryExists(const std::string& path) {
#if defined(_WIN32)
        _mkdir(path.c_str());
#else
        mkdir(path.c_str(), 0755);
#endif
    }
}

Bank::Bank(std::string dataDirectory)
    : dataDir(std::move(dataDirectory)), nextCustomerSeq(1), nextAccountSeq(1), nextTransactionSeq(1) {
    ensureDirectoryExists(dataDir);
    customerFile = dataDir + "/customers.dat";
    accountFile = dataDir + "/accounts.dat";
    transactionFile = dataDir + "/transactions.dat";
    loadData();
}

Bank::~Bank() {
    saveData();
}

std::string Bank::generateCustomerId() { return Utils::generateId("CUST", nextCustomerSeq++); }
std::string Bank::generateAccountNumber() { return Utils::generateId("AC", nextAccountSeq++, 7); }
std::string Bank::generateTransactionId() { return Utils::generateId("TXN", nextTransactionSeq++, 8); }

// ----------------------------------------------------------------------------
// Persistence
// ----------------------------------------------------------------------------

void Bank::loadData() {
    // Default admin: username "admin", password "admin123".
    // In a real system this would be provisioned securely, never hard-coded.
    admin = Admin("ADMIN001", "admin", Utils::hashPassword("admin123"));

    customers.clear();
    accounts.clear();
    transactionsByAccount.clear();

    // --- Customers ---
    {
        std::ifstream in(customerFile);
        std::string line;
        while (std::getline(in, line)) {
            if (Utils::trim(line).empty()) continue;
            Customer c = Customer::fromFileString(line);
            customers[c.getCustomerId()] = c;
            int seq = std::atoi(c.getCustomerId().substr(4).c_str());
            nextCustomerSeq = std::max(nextCustomerSeq, seq + 1);
        }
    }

    // --- Accounts ---
    {
        std::ifstream in(accountFile);
        std::string line;
        while (std::getline(in, line)) {
            if (Utils::trim(line).empty()) continue;
            Account a = Account::fromFileString(line);
            accounts[a.getAccountNumber()] = a;
            int seq = std::atoi(a.getAccountNumber().substr(2).c_str());
            nextAccountSeq = std::max(nextAccountSeq, seq + 1);
        }
    }

    // --- Transactions ---
    {
        std::ifstream in(transactionFile);
        std::string line;
        while (std::getline(in, line)) {
            if (Utils::trim(line).empty()) continue;
            Transaction t = Transaction::fromFileString(line);
            transactionsByAccount[t.getAccountNumber()].push_back(t);
            int seq = std::atoi(t.getTransactionId().substr(3).c_str());
            nextTransactionSeq = std::max(nextTransactionSeq, seq + 1);
        }
    }
}

void Bank::saveData() const {
    {
        std::ofstream out(customerFile, std::ios::trunc);
        if (!out) throw FileIOException("cannot open " + customerFile + " for writing");
        for (const auto& [id, c] : customers) out << c.toFileString() << "\n";
    }
    {
        std::ofstream out(accountFile, std::ios::trunc);
        if (!out) throw FileIOException("cannot open " + accountFile + " for writing");
        for (const auto& [num, a] : accounts) out << a.toFileString() << "\n";
    }
    {
        std::ofstream out(transactionFile, std::ios::trunc);
        if (!out) throw FileIOException("cannot open " + transactionFile + " for writing");
        for (const auto& [accNo, txns] : transactionsByAccount)
            for (const auto& t : txns) out << t.toFileString() << "\n";
    }
}

// ----------------------------------------------------------------------------
// Admin
// ----------------------------------------------------------------------------

bool Bank::adminLogin(const std::string& username, const std::string& password) const {
    return admin.authenticate(username, password);
}

// ----------------------------------------------------------------------------
// Customer registration & auth
// ----------------------------------------------------------------------------

std::string Bank::registerCustomer(const std::string& name, const std::string& address,
                                    const std::string& phone, const std::string& email,
                                    const std::string& password) {
    if (name.empty() || phone.empty() || email.empty()) {
        throw InvalidOperationException("name, phone and email are required to register");
    }
    std::string id = generateCustomerId();
    Customer c(id, name, address, phone, email, Utils::hashPassword(password));
    customers[id] = c;
    saveData();
    return id;
}

Customer* Bank::customerLogin(const std::string& customerId, const std::string& password) {
    auto it = customers.find(customerId);
    if (it == customers.end()) {
        throw CustomerNotFoundException(customerId);
    }
    if (!it->second.authenticate(password)) {
        throw AuthenticationException("incorrect password for customer " + customerId);
    }
    return &it->second;
}

// ----------------------------------------------------------------------------
// Account lifecycle
// ----------------------------------------------------------------------------

std::string Bank::createAccount(const std::string& customerId, AccountType type, double initialDeposit) {
    Customer& cust = findCustomerOrThrow(customerId);

    if (initialDeposit < 0 || !std::isfinite(initialDeposit)) {
        throw InvalidAmountException("initial deposit cannot be negative");
    }
    if (type == AccountType::SAVINGS && initialDeposit < 500.0) {
        throw InvalidOperationException("savings accounts require a minimum opening deposit of 500.00");
    }

    std::string accNo = generateAccountNumber();
    Account acc(accNo, customerId, type, Utils::roundTo2(initialDeposit));
    accounts[accNo] = acc;
    cust.addAccountNumber(accNo);

    if (initialDeposit > 0) {
        recordTransaction(accNo, TransactionType::DEPOSIT, initialDeposit, acc.getBalance(),
                           "Initial deposit on account opening");
    }

    saveData();
    return accNo;
}

void Bank::deleteAccount(const std::string& accountNumber) {
    Account& acc = findAccountOrThrow(accountNumber);
    if (std::abs(acc.getBalance()) > 0.001) {
        std::ostringstream oss;
        oss << "account " << accountNumber
            << " must have a zero balance before it can be closed (current balance: "
            << std::fixed << std::setprecision(2) << acc.getBalance() << ")";
        throw InvalidOperationException(oss.str());
    }
    acc.setStatus(AccountStatus::CLOSED);

    auto custIt = customers.find(acc.getCustomerId());
    if (custIt != customers.end()) {
        custIt->second.removeAccountNumber(accountNumber);
    }
    saveData();
}

void Bank::modifyCustomerDetails(const std::string& customerId, const std::string& name,
                                  const std::string& address, const std::string& phone,
                                  const std::string& email) {
    Customer& c = findCustomerOrThrow(customerId);
    if (!name.empty()) c.setName(name);
    if (!address.empty()) c.setAddress(address);
    if (!phone.empty()) c.setPhone(phone);
    if (!email.empty()) c.setEmail(email);
    saveData();
}

void Bank::freezeAccount(const std::string& accountNumber) {
    Account& acc = findAccountOrThrow(accountNumber);
    if (acc.getStatus() == AccountStatus::CLOSED) {
        throw InvalidOperationException("cannot freeze a closed account");
    }
    acc.setStatus(AccountStatus::FROZEN);
    saveData();
}

void Bank::unfreezeAccount(const std::string& accountNumber) {
    Account& acc = findAccountOrThrow(accountNumber);
    if (acc.getStatus() == AccountStatus::CLOSED) {
        throw InvalidOperationException("cannot unfreeze a closed account");
    }
    acc.setStatus(AccountStatus::ACTIVE);
    saveData();
}

// ----------------------------------------------------------------------------
// Core banking transactions
// ----------------------------------------------------------------------------

void Bank::recordTransaction(const std::string& accountNumber, TransactionType type, double amount,
                              double balanceAfter, const std::string& description) {
    Transaction t(generateTransactionId(), accountNumber, type, Utils::roundTo2(amount),
                  balanceAfter, description);
    transactionsByAccount[accountNumber].push_back(t);
}

void Bank::deposit(const std::string& accountNumber, double amount) {
    Account& acc = findAccountOrThrow(accountNumber);
    acc.credit(amount); // validates amount & account status internally
    recordTransaction(accountNumber, TransactionType::DEPOSIT, amount, acc.getBalance(), "Cash deposit");
    saveData();
}

void Bank::withdraw(const std::string& accountNumber, double amount) {
    Account& acc = findAccountOrThrow(accountNumber);
    acc.debit(amount);
    recordTransaction(accountNumber, TransactionType::WITHDRAWAL, amount, acc.getBalance(), "Cash withdrawal");
    saveData();
}

void Bank::transfer(const std::string& fromAccount, const std::string& toAccount, double amount) {
    if (fromAccount == toAccount) {
        throw InvalidOperationException("cannot transfer to the same account");
    }
    Account& from = findAccountOrThrow(fromAccount);
    Account& to = findAccountOrThrow(toAccount);

    // Debit first; if it throws (insufficient funds / invalid amount), nothing changes.
    from.debit(amount);
    try {
        to.credit(amount);
    } catch (...) {
        // Roll back the debit to keep the ledger consistent, then re-throw.
        from.credit(amount);
        throw;
    }

    recordTransaction(fromAccount, TransactionType::TRANSFER_OUT, amount, from.getBalance(),
                       "Transfer to " + toAccount);
    recordTransaction(toAccount, TransactionType::TRANSFER_IN, amount, to.getBalance(),
                       "Transfer from " + fromAccount);
    saveData();
}

// ----------------------------------------------------------------------------
// Queries
// ----------------------------------------------------------------------------

Account& Bank::findAccountOrThrow(const std::string& accountNumber) {
    auto it = accounts.find(accountNumber);
    if (it == accounts.end()) throw AccountNotFoundException(accountNumber);
    return it->second;
}

Customer& Bank::findCustomerOrThrow(const std::string& customerId) {
    auto it = customers.find(customerId);
    if (it == customers.end()) throw CustomerNotFoundException(customerId);
    return it->second;
}

Account& Bank::getAccount(const std::string& accountNumber) { return findAccountOrThrow(accountNumber); }
Customer& Bank::getCustomer(const std::string& customerId) { return findCustomerOrThrow(customerId); }

bool Bank::accountExists(const std::string& accountNumber) const {
    return accounts.find(accountNumber) != accounts.end();
}
bool Bank::customerExists(const std::string& customerId) const {
    return customers.find(customerId) != customers.end();
}

std::vector<Transaction> Bank::getTransactionHistory(const std::string& accountNumber) const {
    auto it = transactionsByAccount.find(accountNumber);
    if (it == transactionsByAccount.end()) return {};
    return it->second;
}

void Bank::generateStatement(const std::string& accountNumber, std::ostream& out) const {
    auto accIt = accounts.find(accountNumber);
    if (accIt == accounts.end()) throw AccountNotFoundException(accountNumber);
    const Account& acc = accIt->second;

    out << "==================================================================\n";
    out << "                     ACCOUNT STATEMENT\n";
    out << "==================================================================\n";
    out << "Account Number : " << acc.getAccountNumber() << "\n";
    out << "Account Type   : " << Account::typeToString(acc.getType()) << "\n";
    out << "Status         : " << Account::statusToString(acc.getStatus()) << "\n";
    out << "Opened On      : " << acc.getCreationDate() << "\n";
    out << "Current Balance: " << std::fixed << std::setprecision(2) << acc.getBalance() << "\n";
    out << "------------------------------------------------------------------\n";
    out << std::left
        << std::setw(14) << "TxnID" << std::setw(14) << "Account" << std::setw(14) << "Type"
        << std::right << std::setw(12) << "Amount" << std::setw(14) << "Balance"
        << "  " << std::left << std::setw(20) << "Timestamp" << "Description" << "\n";
    out << "------------------------------------------------------------------\n";

    auto it = transactionsByAccount.find(accountNumber);
    if (it != transactionsByAccount.end()) {
        for (const auto& t : it->second) {
            out << std::left
                << std::setw(14) << t.getTransactionId()
                << std::setw(14) << t.getAccountNumber()
                << std::setw(14) << Transaction::typeToString(t.getType())
                << std::right << std::setw(12) << std::fixed << std::setprecision(2) << t.getAmount()
                << std::setw(14) << t.getBalanceAfter()
                << "  " << std::left << std::setw(20) << t.getTimestamp() << t.getDescription() << "\n";
        }
    }
    out << "==================================================================\n";
}

std::vector<Account> Bank::getAccountsForCustomer(const std::string& customerId) const {
    std::vector<Account> result;
    auto it = customers.find(customerId);
    if (it == customers.end()) return result;
    for (const auto& accNo : it->second.getAccountNumbers()) {
        auto accIt = accounts.find(accNo);
        if (accIt != accounts.end()) result.push_back(accIt->second);
    }
    return result;
}

std::vector<Customer> Bank::getAllCustomers() const {
    std::vector<Customer> result;
    result.reserve(customers.size());
    for (const auto& [id, c] : customers) result.push_back(c);
    return result;
}

std::vector<Account> Bank::getAllAccounts() const {
    std::vector<Account> result;
    result.reserve(accounts.size());
    for (const auto& [num, a] : accounts) result.push_back(a);
    return result;
}

// ----------------------------------------------------------------------------
// Loan EMI calculator
// ----------------------------------------------------------------------------

double Bank::calculateEMI(double principal, double annualInterestRatePercent, int tenureMonths) {
    if (principal <= 0) throw InvalidAmountException("loan principal must be positive");
    if (tenureMonths <= 0) throw InvalidOperationException("loan tenure must be at least 1 month");
    if (annualInterestRatePercent < 0) throw InvalidAmountException("interest rate cannot be negative");

    if (annualInterestRatePercent == 0.0) {
        return Utils::roundTo2(principal / tenureMonths);
    }

    double r = (annualInterestRatePercent / 12.0) / 100.0; // monthly rate
    double factor = std::pow(1.0 + r, tenureMonths);
    double emi = (principal * r * factor) / (factor - 1.0);
    return Utils::roundTo2(emi);
}
