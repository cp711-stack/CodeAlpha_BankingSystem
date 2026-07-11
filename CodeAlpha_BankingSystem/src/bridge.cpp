/**
 * @file bridge.cpp
 * @brief JSON-based CLI bridge that wraps the existing C++ Bank class.
 *
 * This program reads a JSON command from stdin and writes a JSON response
 * to stdout. It allows the FastAPI backend to delegate core banking
 * operations to the original C++ engine via subprocess.
 *
 * Supported commands:
 *   {"command": "calculate_emi", "principal": 100000, "annual_rate": 8.5, "tenure_months": 24}
 *   {"command": "validate_transfer", "amount": 1000}
 *   {"command": "health_check"}
 *
 * This file is NEW and does NOT modify any existing C++ source files.
 * It demonstrates C++/Python interop for the portfolio.
 */

#include <iostream>
#include <sstream>
#include <string>
#include <cmath>
#include <iomanip>
#include <map>
#include <functional>

// Include the existing Bank header for EMI calculation
#include "Bank.h"
#include "Exceptions.h"
#include "Utils.h"

namespace {

// -----------------------------------------------------------------------
// Minimal JSON helpers (no external dependency)
// -----------------------------------------------------------------------

/// Trim whitespace
std::string trim(const std::string& s) {
    size_t start = s.find_first_not_of(" \t\r\n");
    if (start == std::string::npos) return "";
    size_t end = s.find_last_not_of(" \t\r\n");
    return s.substr(start, end - start + 1);
}

/// Extract a string value for a given key from a flat JSON object.
std::string jsonGetString(const std::string& json, const std::string& key) {
    std::string search = "\"" + key + "\"";
    size_t pos = json.find(search);
    if (pos == std::string::npos) return "";

    pos = json.find(':', pos + search.size());
    if (pos == std::string::npos) return "";
    pos++;

    // Skip whitespace
    while (pos < json.size() && (json[pos] == ' ' || json[pos] == '\t')) pos++;

    if (pos < json.size() && json[pos] == '"') {
        // String value
        size_t start = pos + 1;
        size_t end = json.find('"', start);
        if (end == std::string::npos) return "";
        return json.substr(start, end - start);
    }
    return "";
}

/// Extract a numeric value for a given key from a flat JSON object.
double jsonGetNumber(const std::string& json, const std::string& key) {
    std::string search = "\"" + key + "\"";
    size_t pos = json.find(search);
    if (pos == std::string::npos) return 0.0;

    pos = json.find(':', pos + search.size());
    if (pos == std::string::npos) return 0.0;
    pos++;

    while (pos < json.size() && (json[pos] == ' ' || json[pos] == '\t')) pos++;

    std::string numStr;
    while (pos < json.size() && (std::isdigit(json[pos]) || json[pos] == '.' || json[pos] == '-')) {
        numStr += json[pos];
        pos++;
    }

    try { return std::stod(numStr); }
    catch (...) { return 0.0; }
}

/// Build a JSON response string.
std::string jsonResponse(bool success, const std::string& data) {
    std::ostringstream oss;
    oss << "{\"success\": " << (success ? "true" : "false") << ", " << data << "}";
    return oss.str();
}

std::string jsonError(const std::string& message) {
    return jsonResponse(false, "\"error\": \"" + message + "\"");
}

// -----------------------------------------------------------------------
// Command handlers
// -----------------------------------------------------------------------

std::string handleCalculateEMI(const std::string& json) {
    double principal = jsonGetNumber(json, "principal");
    double annualRate = jsonGetNumber(json, "annual_rate");
    int tenureMonths = static_cast<int>(jsonGetNumber(json, "tenure_months"));

    try {
        double emi = Bank::calculateEMI(principal, annualRate, tenureMonths);
        double totalPayment = Utils::roundTo2(emi * tenureMonths);
        double totalInterest = Utils::roundTo2(totalPayment - principal);

        std::ostringstream data;
        data << std::fixed << std::setprecision(2)
             << "\"emi\": " << emi
             << ", \"total_payment\": " << totalPayment
             << ", \"total_interest\": " << totalInterest
             << ", \"principal\": " << principal
             << ", \"annual_rate\": " << annualRate
             << ", \"tenure_months\": " << tenureMonths;
        return jsonResponse(true, data.str());
    } catch (const BankException& e) {
        return jsonError(e.what());
    } catch (const std::exception& e) {
        return jsonError(e.what());
    }
}

std::string handleHealthCheck(const std::string& /*json*/) {
    return jsonResponse(true,
        "\"engine\": \"CodeAlpha C++ Banking Engine\""
        ", \"version\": \"1.0.0\""
        ", \"status\": \"healthy\""
        ", \"cpp_standard\": \"C++17\"");
}

std::string handleValidateAmount(const std::string& json) {
    double amount = jsonGetNumber(json, "amount");
    bool valid = Utils::isValidAmount(amount);
    std::ostringstream data;
    data << "\"valid\": " << (valid ? "true" : "false")
         << ", \"amount\": " << std::fixed << std::setprecision(2) << amount;
    return jsonResponse(true, data.str());
}

} // anonymous namespace

int main() {
    // Read the entire stdin as the JSON command
    std::string input;
    std::string line;
    while (std::getline(std::cin, line)) {
        input += line;
    }
    input = trim(input);

    if (input.empty()) {
        std::cout << jsonError("empty input") << std::endl;
        return 1;
    }

    std::string command = jsonGetString(input, "command");

    if (command == "calculate_emi") {
        std::cout << handleCalculateEMI(input) << std::endl;
    } else if (command == "health_check") {
        std::cout << handleHealthCheck(input) << std::endl;
    } else if (command == "validate_amount") {
        std::cout << handleValidateAmount(input) << std::endl;
    } else {
        std::cout << jsonError("unknown command: " + command) << std::endl;
        return 1;
    }

    return 0;
}
