/**
 * @file Account.cpp
 * @brief Implementation of the Account class.
 */
#include "Account.h"
#include "Exceptions.h"
#include "Utils.h"
#include <iostream>
#include <iomanip>
#include <sstream>

constexpr double Account::MIN_SAVINGS_BALANCE;

namespace {
    std::string money(double v) {
        std::ostringstream oss;
        oss << std::fixed << std::setprecision(2) << v;
        return oss.str();
    }
}

Account::Account()
    : accountNumber(""), customerId(""), type(AccountType::SAVINGS),
      balance(0.0), status(AccountStatus::ACTIVE), creationDate("") {}

Account::Account(const std::string& accNo, const std::string& custId, AccountType type,
                  double initialBalance, AccountStatus status, const std::string& creationDate)
    : accountNumber(accNo), customerId(custId), type(type), balance(initialBalance),
      status(status), creationDate(creationDate.empty() ? Utils::getCurrentTimestamp() : creationDate) {}

std::string Account::getAccountNumber() const { return accountNumber; }
std::string Account::getCustomerId() const { return customerId; }
AccountType Account::getType() const { return type; }
double Account::getBalance() const { return balance; }
AccountStatus Account::getStatus() const { return status; }
std::string Account::getCreationDate() const { return creationDate; }

void Account::setStatus(AccountStatus s) { status = s; }

bool Account::isActive() const { return status == AccountStatus::ACTIVE; }

void Account::credit(double amount) {
    if (!Utils::isValidAmount(amount)) {
        throw InvalidAmountException("credit amount must be positive, got " + money(amount));
    }
    if (status == AccountStatus::CLOSED) {
        throw InvalidOperationException("cannot credit a closed account (" + accountNumber + ")");
    }
    if (status == AccountStatus::FROZEN) {
        throw InvalidOperationException("cannot credit a frozen account (" + accountNumber + ")");
    }
    balance = Utils::roundTo2(balance + amount);
}

void Account::debit(double amount) {
    if (!Utils::isValidAmount(amount)) {
        throw InvalidAmountException("debit amount must be positive, got " + money(amount));
    }
    if (status == AccountStatus::CLOSED) {
        throw InvalidOperationException("cannot debit a closed account (" + accountNumber + ")");
    }
    if (status == AccountStatus::FROZEN) {
        throw InvalidOperationException("cannot debit a frozen account (" + accountNumber + ")");
    }

    double minRequired = (type == AccountType::SAVINGS) ? MIN_SAVINGS_BALANCE : 0.0;
    if (balance - amount < minRequired) {
        throw InsufficientFundsException(accountNumber, balance, amount);
    }
    balance = Utils::roundTo2(balance - amount);
}

std::string Account::typeToString(AccountType t) {
    return t == AccountType::SAVINGS ? "SAVINGS" : "CURRENT";
}

AccountType Account::stringToType(const std::string& s) {
    if (s == "SAVINGS") return AccountType::SAVINGS;
    if (s == "CURRENT") return AccountType::CURRENT;
    throw FileIOException("Unknown account type in data file: " + s);
}

std::string Account::statusToString(AccountStatus s) {
    switch (s) {
        case AccountStatus::ACTIVE: return "ACTIVE";
        case AccountStatus::FROZEN: return "FROZEN";
        case AccountStatus::CLOSED: return "CLOSED";
    }
    return "UNKNOWN";
}

AccountStatus Account::stringToStatus(const std::string& s) {
    if (s == "ACTIVE") return AccountStatus::ACTIVE;
    if (s == "FROZEN") return AccountStatus::FROZEN;
    if (s == "CLOSED") return AccountStatus::CLOSED;
    throw FileIOException("Unknown account status in data file: " + s);
}

std::string Account::toFileString() const {
    std::ostringstream oss;
    oss << accountNumber << "|" << customerId << "|" << typeToString(type) << "|"
        << std::fixed << std::setprecision(2) << balance << "|" << statusToString(status)
        << "|" << creationDate;
    return oss.str();
}

Account Account::fromFileString(const std::string& line) {
    auto tokens = Utils::split(line, '|');
    if (tokens.size() < 6) {
        throw FileIOException("Malformed account record: " + line);
    }
    return Account(tokens[0], tokens[1], stringToType(tokens[2]),
                    std::stod(tokens[3]), stringToStatus(tokens[4]), tokens[5]);
}

void Account::display() const {
    std::cout << std::left
              << std::setw(14) << accountNumber
              << std::setw(14) << customerId
              << std::setw(10) << typeToString(type)
              << std::right << std::setw(14) << std::fixed << std::setprecision(2) << balance
              << "  " << std::left << std::setw(8) << statusToString(status)
              << creationDate << "\n";
}
