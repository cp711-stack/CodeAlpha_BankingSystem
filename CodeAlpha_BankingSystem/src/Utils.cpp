/**
 * @file Utils.cpp
 * @brief Implementation of shared helper functions.
 */
#include "Utils.h"
#include <chrono>
#include <ctime>
#include <sstream>
#include <iomanip>
#include <algorithm>
#include <cmath>
#include <functional>
#include <iostream>
#include <limits>

namespace Utils {

std::string getCurrentTimestamp() {
    auto now = std::chrono::system_clock::now();
    std::time_t t = std::chrono::system_clock::to_time_t(now);
    std::tm tmBuf{};
#if defined(_WIN32)
    localtime_s(&tmBuf, &t);
#else
    localtime_r(&t, &tmBuf);
#endif
    std::ostringstream oss;
    oss << std::put_time(&tmBuf, "%Y-%m-%d %H:%M:%S");
    return oss.str();
}

std::string generateId(const std::string& prefix, int number, int width) {
    std::ostringstream oss;
    oss << prefix << std::setw(width) << std::setfill('0') << number;
    return oss.str();
}

std::vector<std::string> split(const std::string& s, char delim) {
    std::vector<std::string> tokens;
    std::stringstream ss(s);
    std::string item;
    while (std::getline(ss, item, delim)) {
        tokens.push_back(item);
    }
    // Preserve a trailing empty field (e.g. "a|b|" -> {"a","b",""})
    if (!s.empty() && s.back() == delim) {
        tokens.push_back("");
    }
    return tokens;
}

std::string trim(const std::string& s) {
    size_t start = s.find_first_not_of(" \t\r\n");
    if (start == std::string::npos) return "";
    size_t end = s.find_last_not_of(" \t\r\n");
    return s.substr(start, end - start + 1);
}

std::string hashPassword(const std::string& password) {
    // Deterministic non-cryptographic hash (std::hash + salt constant).
    // Swap for bcrypt/argon2 in a real deployment.
    static const std::string salt = "CodeAlpha_BankingSystem_Salt_v1";
    std::hash<std::string> hasher;
    size_t h = hasher(salt + password);
    std::ostringstream oss;
    oss << std::hex << h;
    return oss.str();
}

double roundTo2(double value) {
    return std::round(value * 100.0) / 100.0;
}

bool isValidAmount(double amount) {
    return std::isfinite(amount) && amount > 0.0;
}

std::string maskAccountNumber(const std::string& accNo) {
    if (accNo.size() <= 4) return accNo;
    return std::string(accNo.size() - 4, '*') + accNo.substr(accNo.size() - 4);
}

double readPositiveDouble(const std::string& prompt) {
    double value;
    while (true) {
        std::cout << prompt;
        std::cin >> value;
        if (std::cin.fail() || value <= 0) {
            std::cin.clear();
            std::cin.ignore(std::numeric_limits<std::streamsize>::max(), '\n');
            std::cout << "  Please enter a valid positive number.\n";
            continue;
        }
        std::cin.ignore(std::numeric_limits<std::streamsize>::max(), '\n');
        return value;
    }
}

int readMenuChoice(const std::string& prompt, int minValue, int maxValue) {
    int value;
    while (true) {
        std::cout << prompt;
        std::cin >> value;
        if (std::cin.fail() || value < minValue || value > maxValue) {
            std::cin.clear();
            std::cin.ignore(std::numeric_limits<std::streamsize>::max(), '\n');
            std::cout << "  Please enter a number between " << minValue << " and " << maxValue << ".\n";
            continue;
        }
        std::cin.ignore(std::numeric_limits<std::streamsize>::max(), '\n');
        return value;
    }
}

std::string readNonEmptyLine(const std::string& prompt) {
    std::string line;
    while (true) {
        std::cout << prompt;
        std::getline(std::cin, line);
        line = trim(line);
        if (!line.empty()) return line;
        std::cout << "  This field cannot be empty.\n";
    }
}

} // namespace Utils
