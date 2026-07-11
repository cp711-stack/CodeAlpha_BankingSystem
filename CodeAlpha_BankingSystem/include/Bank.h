/**
 * @file Bank.h
 * @brief Core orchestration layer: owns all customers/accounts/transactions,
 *        enforces business rules, and handles persistence.
 *
 * Bank is the single point of entry the UI (main.cpp) talks to. It keeps
 * in-memory STL containers as the "hot" data store and mirrors them to flat
 * files under data/ so state survives across runs.
 */
#ifndef BANK_H
#define BANK_H

#include <string>
#include <vector>
#include <unordered_map>
#include <map>
#include <ostream>

#include "Customer.h"
#include "Account.h"
#include "Transaction.h"
#include "Admin.h"

class Bank {
private:
    std::unordered_map<std::string, Customer> customers;              // key: customerId
    std::unordered_map<std::string, Account> accounts;                // key: accountNumber
    std::map<std::string, std::vector<Transaction>> transactionsByAccount; // key: accountNumber

    Admin admin;

    std::string dataDir;
    std::string customerFile;
    std::string accountFile;
    std::string transactionFile;

    int nextCustomerSeq;
    int nextAccountSeq;
    int nextTransactionSeq;

    std::string generateCustomerId();
    std::string generateAccountNumber();
    std::string generateTransactionId();

    void recordTransaction(const std::string& accountNumber, TransactionType type,
                            double amount, double balanceAfter, const std::string& description);

    Account& findAccountOrThrow(const std::string& accountNumber);
    Customer& findCustomerOrThrow(const std::string& customerId);

public:
    explicit Bank(std::string dataDirectory = "data");
    ~Bank();

    // --- Persistence ---
    void loadData();
    void saveData() const;

    // --- Admin ---
    bool adminLogin(const std::string& username, const std::string& password) const;

    // --- Customer registration & auth ---
    std::string registerCustomer(const std::string& name, const std::string& address,
                                  const std::string& phone, const std::string& email,
                                  const std::string& password);
    Customer* customerLogin(const std::string& customerId, const std::string& password);

    // --- Account lifecycle (Create / Modify / Delete) ---
    std::string createAccount(const std::string& customerId, AccountType type, double initialDeposit);
    void deleteAccount(const std::string& accountNumber);
    void modifyCustomerDetails(const std::string& customerId, const std::string& name,
                                const std::string& address, const std::string& phone,
                                const std::string& email);
    void freezeAccount(const std::string& accountNumber);
    void unfreezeAccount(const std::string& accountNumber);

    // --- Core banking transactions ---
    void deposit(const std::string& accountNumber, double amount);
    void withdraw(const std::string& accountNumber, double amount);
    void transfer(const std::string& fromAccount, const std::string& toAccount, double amount);

    // --- Queries ---
    Account& getAccount(const std::string& accountNumber);
    Customer& getCustomer(const std::string& customerId);
    bool accountExists(const std::string& accountNumber) const;
    bool customerExists(const std::string& customerId) const;

    std::vector<Transaction> getTransactionHistory(const std::string& accountNumber) const;
    void generateStatement(const std::string& accountNumber, std::ostream& out) const;

    std::vector<Account> getAccountsForCustomer(const std::string& customerId) const;
    std::vector<Customer> getAllCustomers() const;
    std::vector<Account> getAllAccounts() const;

    // --- Loan EMI calculator ---
    // Standard reducing-balance EMI formula:
    //   EMI = P * r * (1+r)^n / ((1+r)^n - 1)
    // where P = principal, r = monthly interest rate, n = tenure in months.
    static double calculateEMI(double principal, double annualInterestRatePercent, int tenureMonths);
};

#endif // BANK_H
