/**
 * @file Customer.h
 * @brief Represents a bank customer and the accounts they own.
 */
#ifndef CUSTOMER_H
#define CUSTOMER_H

#include <string>
#include <vector>

class Customer {
private:
    std::string customerId;
    std::string name;
    std::string address;
    std::string phone;
    std::string email;
    std::string passwordHash;
    std::vector<std::string> accountNumbers;

public:
    Customer();
    Customer(const std::string& id,
             const std::string& name,
             const std::string& address,
             const std::string& phone,
             const std::string& email,
             const std::string& passwordHash);

    // --- Accessors ---
    std::string getCustomerId() const;
    std::string getName() const;
    std::string getAddress() const;
    std::string getPhone() const;
    std::string getEmail() const;
    std::string getPasswordHash() const;
    const std::vector<std::string>& getAccountNumbers() const;

    // --- Mutators ---
    void setName(const std::string& n);
    void setAddress(const std::string& a);
    void setPhone(const std::string& p);
    void setEmail(const std::string& e);
    void setPasswordHash(const std::string& h);

    void addAccountNumber(const std::string& accNo);
    void removeAccountNumber(const std::string& accNo);

    /// Compares the hash of the supplied plaintext password against the stored hash.
    bool authenticate(const std::string& password) const;

    std::string toFileString() const;
    static Customer fromFileString(const std::string& line);

    void display() const;
};

#endif // CUSTOMER_H
