/**
 * @file Transaction.cpp
 * @brief Implementation of the Transaction class.
 */
#include "Transaction.h"
#include "Utils.h"
#include "Exceptions.h"
#include <iostream>
#include <iomanip>
#include <sstream>

Transaction::Transaction()
    : transactionId(""), accountNumber(""), type(TransactionType::DEPOSIT),
      amount(0.0), balanceAfter(0.0), timestamp(""), description("") {}

Transaction::Transaction(const std::string& id, const std::string& accNo, TransactionType type,
                          double amount, double balanceAfter, const std::string& description,
                          const std::string& timestamp)
    : transactionId(id), accountNumber(accNo), type(type), amount(amount),
      balanceAfter(balanceAfter), timestamp(timestamp.empty() ? Utils::getCurrentTimestamp() : timestamp),
      description(description) {}

std::string Transaction::getTransactionId() const { return transactionId; }
std::string Transaction::getAccountNumber() const { return accountNumber; }
TransactionType Transaction::getType() const { return type; }
double Transaction::getAmount() const { return amount; }
double Transaction::getBalanceAfter() const { return balanceAfter; }
std::string Transaction::getTimestamp() const { return timestamp; }
std::string Transaction::getDescription() const { return description; }

std::string Transaction::typeToString(TransactionType t) {
    switch (t) {
        case TransactionType::DEPOSIT:       return "DEPOSIT";
        case TransactionType::WITHDRAWAL:    return "WITHDRAWAL";
        case TransactionType::TRANSFER_IN:   return "TRANSFER_IN";
        case TransactionType::TRANSFER_OUT:  return "TRANSFER_OUT";
        case TransactionType::LOAN_DISBURSAL:return "LOAN_DISBURSAL";
    }
    return "UNKNOWN";
}

TransactionType Transaction::stringToType(const std::string& s) {
    if (s == "DEPOSIT") return TransactionType::DEPOSIT;
    if (s == "WITHDRAWAL") return TransactionType::WITHDRAWAL;
    if (s == "TRANSFER_IN") return TransactionType::TRANSFER_IN;
    if (s == "TRANSFER_OUT") return TransactionType::TRANSFER_OUT;
    if (s == "LOAN_DISBURSAL") return TransactionType::LOAN_DISBURSAL;
    throw FileIOException("Unknown transaction type in data file: " + s);
}

std::string Transaction::toFileString() const {
    std::ostringstream oss;
    oss << transactionId << "|" << accountNumber << "|" << typeToString(type) << "|"
        << std::fixed << std::setprecision(2) << amount << "|" << balanceAfter << "|"
        << timestamp << "|" << description;
    return oss.str();
}

Transaction Transaction::fromFileString(const std::string& line) {
    auto tokens = Utils::split(line, '|');
    if (tokens.size() < 6) {
        throw FileIOException("Malformed transaction record: " + line);
    }
    std::string description = tokens.size() > 6 ? tokens[6] : "";
    return Transaction(tokens[0], tokens[1], stringToType(tokens[2]),
                        std::stod(tokens[3]), std::stod(tokens[4]), description, tokens[5]);
}

void Transaction::display() const {
    std::cout << std::left
              << std::setw(14) << transactionId
              << std::setw(14) << accountNumber
              << std::setw(14) << typeToString(type)
              << std::right << std::setw(12) << std::fixed << std::setprecision(2) << amount
              << std::setw(14) << balanceAfter
              << "  " << std::left << std::setw(20) << timestamp
              << description << "\n";
}
