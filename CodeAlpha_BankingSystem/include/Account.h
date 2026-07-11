/**
 * @file Account.h
 * @brief Represents a bank account owned by a Customer.
 */
#ifndef ACCOUNT_H
#define ACCOUNT_H

#include <string>

enum class AccountType {
    SAVINGS,
    CURRENT
};

enum class AccountStatus {
    ACTIVE,
    FROZEN,
    CLOSED
};

class Account {
private:
    std::string accountNumber;
    std::string customerId;
    AccountType type;
    double balance;
    AccountStatus status;
    std::string creationDate;

    static constexpr double MIN_SAVINGS_BALANCE = 500.0;

public:
    Account();
    Account(const std::string& accNo,
            const std::string& custId,
            AccountType type,
            double initialBalance,
            AccountStatus status = AccountStatus::ACTIVE,
            const std::string& creationDate = "");

    // --- Accessors ---
    std::string getAccountNumber() const;
    std::string getCustomerId() const;
    AccountType getType() const;
    double getBalance() const;
    AccountStatus getStatus() const;
    std::string getCreationDate() const;

    void setStatus(AccountStatus s);

    /// Credits (adds to) the balance. Throws InvalidAmountException for amount <= 0.
    void credit(double amount);

    /// Debits (subtracts from) the balance.
    /// Throws InvalidAmountException for amount <= 0.
    /// Throws InsufficientFundsException if the withdrawal would breach the
    /// minimum balance requirement (savings accounts only) or overdraw the account.
    void debit(double amount);

    bool isActive() const;

    static std::string typeToString(AccountType type);
    static AccountType stringToType(const std::string& s);
    static std::string statusToString(AccountStatus status);
    static AccountStatus stringToStatus(const std::string& s);

    std::string toFileString() const;
    static Account fromFileString(const std::string& line);

    void display() const;
};

#endif // ACCOUNT_H
