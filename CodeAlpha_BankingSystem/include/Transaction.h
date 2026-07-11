/**
 * @file Transaction.h
 * @brief Represents a single immutable ledger entry against an account.
 */
#ifndef TRANSACTION_H
#define TRANSACTION_H

#include <string>

/// Type of monetary movement recorded against an account.
enum class TransactionType {
    DEPOSIT,
    WITHDRAWAL,
    TRANSFER_IN,
    TRANSFER_OUT,
    LOAN_DISBURSAL
};

class Transaction {
private:
    std::string transactionId;
    std::string accountNumber;
    TransactionType type;
    double amount;
    double balanceAfter;
    std::string timestamp;
    std::string description;

public:
    Transaction();
    Transaction(const std::string& id,
                const std::string& accNo,
                TransactionType type,
                double amount,
                double balanceAfter,
                const std::string& description = "",
                const std::string& timestamp = "");

    // --- Accessors ---
    std::string getTransactionId() const;
    std::string getAccountNumber() const;
    TransactionType getType() const;
    double getAmount() const;
    double getBalanceAfter() const;
    std::string getTimestamp() const;
    std::string getDescription() const;

    static std::string typeToString(TransactionType type);
    static TransactionType stringToType(const std::string& s);

    /// Serializes to a single pipe-delimited line for flat-file persistence.
    std::string toFileString() const;
    /// Reconstructs a Transaction from a line produced by toFileString().
    static Transaction fromFileString(const std::string& line);

    /// Prints a single formatted row (used by statements/history views).
    void display() const;
};

#endif // TRANSACTION_H
