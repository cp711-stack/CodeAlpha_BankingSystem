/**
 * @file Customer.cpp
 * @brief Implementation of the Customer class.
 */
#include "Customer.h"
#include "Utils.h"
#include "Exceptions.h"
#include <iostream>
#include <iomanip>
#include <sstream>
#include <algorithm>

Customer::Customer() = default;

Customer::Customer(const std::string& id, const std::string& name, const std::string& address,
                    const std::string& phone, const std::string& email, const std::string& passwordHash)
    : customerId(id), name(name), address(address), phone(phone), email(email),
      passwordHash(passwordHash) {}

std::string Customer::getCustomerId() const { return customerId; }
std::string Customer::getName() const { return name; }
std::string Customer::getAddress() const { return address; }
std::string Customer::getPhone() const { return phone; }
std::string Customer::getEmail() const { return email; }
std::string Customer::getPasswordHash() const { return passwordHash; }
const std::vector<std::string>& Customer::getAccountNumbers() const { return accountNumbers; }

void Customer::setName(const std::string& n) { name = n; }
void Customer::setAddress(const std::string& a) { address = a; }
void Customer::setPhone(const std::string& p) { phone = p; }
void Customer::setEmail(const std::string& e) { email = e; }
void Customer::setPasswordHash(const std::string& h) { passwordHash = h; }

void Customer::addAccountNumber(const std::string& accNo) {
    accountNumbers.push_back(accNo);
}

void Customer::removeAccountNumber(const std::string& accNo) {
    accountNumbers.erase(std::remove(accountNumbers.begin(), accountNumbers.end(), accNo),
                          accountNumbers.end());
}

bool Customer::authenticate(const std::string& password) const {
    return Utils::hashPassword(password) == passwordHash;
}

std::string Customer::toFileString() const {
    std::ostringstream oss;
    oss << customerId << "|" << name << "|" << address << "|" << phone << "|" << email << "|"
        << passwordHash << "|";
    for (size_t i = 0; i < accountNumbers.size(); ++i) {
        oss << accountNumbers[i];
        if (i + 1 < accountNumbers.size()) oss << ",";
    }
    return oss.str();
}

Customer Customer::fromFileString(const std::string& line) {
    auto tokens = Utils::split(line, '|');
    if (tokens.size() < 6) {
        throw FileIOException("Malformed customer record: " + line);
    }
    Customer c(tokens[0], tokens[1], tokens[2], tokens[3], tokens[4], tokens[5]);
    if (tokens.size() > 6 && !tokens[6].empty()) {
        auto accs = Utils::split(tokens[6], ',');
        for (const auto& a : accs) {
            if (!a.empty()) c.addAccountNumber(a);
        }
    }
    return c;
}

void Customer::display() const {
    std::cout << std::left
              << std::setw(12) << customerId
              << std::setw(20) << name
              << std::setw(15) << phone
              << email << "\n";
}
