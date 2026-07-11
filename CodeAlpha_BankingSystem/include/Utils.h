/**
 * @file Utils.h
 * @brief Small, stateless helper functions shared across the project.
 */
#ifndef UTILS_H
#define UTILS_H

#include <string>
#include <vector>

namespace Utils {

    /// Returns the current local date-time as "YYYY-MM-DD HH:MM:SS".
    std::string getCurrentTimestamp();

    /// Builds a zero-padded id such as "CUST00001" from a prefix + running number.
    std::string generateId(const std::string& prefix, int number, int width = 5);

    /// Splits a string on a delimiter (used for the pipe-delimited flat file format).
    std::vector<std::string> split(const std::string& s, char delim);

    /// Trims leading/trailing whitespace.
    std::string trim(const std::string& s);

    /// A deterministic, non-cryptographic password hash.
    /// NOTE: For a real production system this must be replaced with a salted
    /// cryptographic hash (bcrypt/argon2). It is intentionally simple here so the
    /// project has zero external dependencies and stays portable/compilable anywhere.
    std::string hashPassword(const std::string& password);

    /// Rounds a monetary value to 2 decimal places to avoid floating point drift.
    double roundTo2(double value);

    /// True if the amount is finite and strictly positive.
    bool isValidAmount(double amount);

    /// Masks all but the last 4 digits of an account number, e.g. "AC0000001" -> "AC****001" style masking.
    std::string maskAccountNumber(const std::string& accNo);

    /// Reads a full line of numeric/text input safely, re-prompting on failure.
    double readPositiveDouble(const std::string& prompt);

    int readMenuChoice(const std::string& prompt, int minValue, int maxValue);

    std::string readNonEmptyLine(const std::string& prompt);
}

#endif // UTILS_H
