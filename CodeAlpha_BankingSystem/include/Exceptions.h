/**
 * @file Exceptions.h
 * @brief Custom exception hierarchy used throughout the Banking Management System.
 *
 * All exceptions derive from BankException (which itself derives from std::exception)
 * so callers can choose to catch broadly (BankException&) or narrowly (a specific type).
 */
#ifndef EXCEPTIONS_H
#define EXCEPTIONS_H

#include <exception>
#include <string>
#include <sstream>
#include <iomanip>

namespace detail {
    inline std::string money(double v) {
        std::ostringstream oss;
        oss << std::fixed << std::setprecision(2) << v;
        return oss.str();
    }
}

/// Base class for every exception raised by the banking system.
class BankException : public std::exception {
protected:
    std::string message;
public:
    explicit BankException(const std::string& msg) : message(msg) {}
    const char* what() const noexcept override { return message.c_str(); }
    virtual ~BankException() noexcept = default;
};

/// Thrown when an account number cannot be located in the system.
class AccountNotFoundException : public BankException {
public:
    explicit AccountNotFoundException(const std::string& accNo)
        : BankException("Account not found: " + accNo) {}
};

/// Thrown when a customer id cannot be located in the system.
class CustomerNotFoundException : public BankException {
public:
    explicit CustomerNotFoundException(const std::string& id)
        : BankException("Customer not found: " + id) {}
};

/// Thrown when a withdrawal/transfer/debit exceeds the available balance.
class InsufficientFundsException : public BankException {
public:
    InsufficientFundsException(const std::string& accNo, double balance, double requested)
        : BankException("Insufficient funds in account " + accNo +
                         " (available: " + detail::money(balance) +
                         ", requested: " + detail::money(requested) + ")") {}
};

/// Thrown when an amount supplied to a monetary operation is invalid (<= 0, NaN, etc).
class InvalidAmountException : public BankException {
public:
    explicit InvalidAmountException(const std::string& msg)
        : BankException("Invalid amount: " + msg) {}
};

/// Thrown when login credentials do not match.
class AuthenticationException : public BankException {
public:
    explicit AuthenticationException(const std::string& msg)
        : BankException("Authentication failed: " + msg) {}
};

/// Thrown when attempting to create an account/customer that already exists.
class DuplicateAccountException : public BankException {
public:
    explicit DuplicateAccountException(const std::string& accNo)
        : BankException("Account already exists: " + accNo) {}
};

/// Thrown when an operation is not permitted given the current system/account state.
class InvalidOperationException : public BankException {
public:
    explicit InvalidOperationException(const std::string& msg)
        : BankException("Invalid operation: " + msg) {}
};

/// Thrown when persistent storage cannot be read from or written to.
class FileIOException : public BankException {
public:
    explicit FileIOException(const std::string& msg)
        : BankException("File I/O error: " + msg) {}
};

#endif // EXCEPTIONS_H
