/**
 * @file main.cpp
 * @brief Menu-driven console entry point for the Banking Management System.
 *
 * Presents a role-selection menu (Admin / Customer / Register), then routes
 * into role-specific menus. All business rules live in Bank; this file is
 * purely presentation + input handling, wrapped in try/catch around every
 * operation so the app never crashes on bad input or business-rule violations.
 */
#include <iostream>
#include <iomanip>
#include <limits>

#include "Bank.h"
#include "Exceptions.h"
#include "Utils.h"

namespace {

void printHeader(const std::string& title) {
    std::cout << "\n==================================================================\n";
    std::cout << "  " << title << "\n";
    std::cout << "==================================================================\n";
}

void pause() {
    std::cout << "\nPress Enter to continue...";
    std::cin.get();
}

AccountType promptAccountType() {
    int choice = Utils::readMenuChoice("Account Type [1] Savings  [2] Current: ", 1, 2);
    return choice == 1 ? AccountType::SAVINGS : AccountType::CURRENT;
}

// ---------------------------------------------------------------------------
// Customer session
// ---------------------------------------------------------------------------

void customerMenu(Bank& bank, Customer& customer) {
    while (true) {
        printHeader("CUSTOMER MENU  -  " + customer.getName() + " (" + customer.getCustomerId() + ")");
        std::cout << "1. View My Accounts\n"
                  << "2. Open New Account\n"
                  << "3. Deposit\n"
                  << "4. Withdraw\n"
                  << "5. Transfer Funds\n"
                  << "6. Transaction History\n"
                  << "7. Generate Account Statement\n"
                  << "8. Loan EMI Calculator\n"
                  << "9. Update My Profile\n"
                  << "10. Close an Account\n"
                  << "0. Logout\n";
        int choice = Utils::readMenuChoice("Select an option: ", 0, 10);

        try {
            switch (choice) {
                case 1: {
                    auto accs = bank.getAccountsForCustomer(customer.getCustomerId());
                    if (accs.empty()) { std::cout << "You have no accounts yet.\n"; break; }
                    std::cout << std::left << std::setw(14) << "AccNo" << std::setw(14) << "Owner"
                              << std::setw(10) << "Type" << std::right << std::setw(14) << "Balance"
                              << "  Status  Opened\n";
                    for (auto& a : accs) a.display();
                    break;
                }
                case 2: {
                    AccountType type = promptAccountType();
                    double deposit = Utils::readPositiveDouble("Initial deposit amount: ");
                    std::string accNo = bank.createAccount(customer.getCustomerId(), type, deposit);
                    std::cout << "Account created successfully. Account Number: " << accNo << "\n";
                    break;
                }
                case 3: {
                    std::string accNo = Utils::readNonEmptyLine("Account number: ");
                    double amt = Utils::readPositiveDouble("Deposit amount: ");
                    bank.deposit(accNo, amt);
                    std::cout << "Deposit successful. New balance: "
                              << std::fixed << std::setprecision(2) << bank.getAccount(accNo).getBalance() << "\n";
                    break;
                }
                case 4: {
                    std::string accNo = Utils::readNonEmptyLine("Account number: ");
                    double amt = Utils::readPositiveDouble("Withdrawal amount: ");
                    bank.withdraw(accNo, amt);
                    std::cout << "Withdrawal successful. New balance: "
                              << std::fixed << std::setprecision(2) << bank.getAccount(accNo).getBalance() << "\n";
                    break;
                }
                case 5: {
                    std::string fromAcc = Utils::readNonEmptyLine("From account number: ");
                    std::string toAcc = Utils::readNonEmptyLine("To account number: ");
                    double amt = Utils::readPositiveDouble("Transfer amount: ");
                    bank.transfer(fromAcc, toAcc, amt);
                    std::cout << "Transfer successful.\n";
                    break;
                }
                case 6: {
                    std::string accNo = Utils::readNonEmptyLine("Account number: ");
                    auto txns = bank.getTransactionHistory(accNo);
                    if (txns.empty()) { std::cout << "No transactions found for this account.\n"; break; }
                    std::cout << std::left << std::setw(14) << "TxnID" << std::setw(14) << "Account"
                              << std::setw(14) << "Type" << std::right << std::setw(12) << "Amount"
                              << std::setw(14) << "Balance" << "  Timestamp            Description\n";
                    for (const auto& t : txns) t.display();
                    break;
                }
                case 7: {
                    std::string accNo = Utils::readNonEmptyLine("Account number: ");
                    bank.generateStatement(accNo, std::cout);
                    break;
                }
                case 8: {
                    double principal = Utils::readPositiveDouble("Loan principal amount: ");
                    double rate = Utils::readPositiveDouble("Annual interest rate (%): ");
                    int tenure = Utils::readMenuChoice("Tenure in months (1-360): ", 1, 360);
                    double emi = Bank::calculateEMI(principal, rate, tenure);
                    double totalPayment = Utils::roundTo2(emi * tenure);
                    double totalInterest = Utils::roundTo2(totalPayment - principal);
                    std::cout << std::fixed << std::setprecision(2);
                    std::cout << "\nMonthly EMI     : " << emi << "\n";
                    std::cout << "Total Payment   : " << totalPayment << "\n";
                    std::cout << "Total Interest  : " << totalInterest << "\n";
                    break;
                }
                case 9: {
                    std::cout << "(Leave a field blank to keep it unchanged.)\n";
                    std::cout << "Name: ";
                    std::string name; std::getline(std::cin, name);
                    std::cout << "Address: ";
                    std::string addr; std::getline(std::cin, addr);
                    std::cout << "Phone: ";
                    std::string phone; std::getline(std::cin, phone);
                    std::cout << "Email: ";
                    std::string email; std::getline(std::cin, email);
                    bank.modifyCustomerDetails(customer.getCustomerId(), name, addr, phone, email);
                    std::cout << "Profile updated.\n";
                    break;
                }
                case 10: {
                    std::string accNo = Utils::readNonEmptyLine("Account number to close: ");
                    bank.deleteAccount(accNo);
                    std::cout << "Account closed successfully.\n";
                    break;
                }
                case 0:
                    std::cout << "Logging out...\n";
                    return;
            }
        } catch (const BankException& e) {
            std::cout << "Error: " << e.what() << "\n";
        }
        pause();
    }
}

// ---------------------------------------------------------------------------
// Admin session
// ---------------------------------------------------------------------------

void adminMenu(Bank& bank) {
    while (true) {
        printHeader("ADMIN MENU");
        std::cout << "1. View All Customers\n"
                  << "2. View All Accounts\n"
                  << "3. Create Account For Customer\n"
                  << "4. Delete/Close Account\n"
                  << "5. Modify Customer Details\n"
                  << "6. Freeze Account\n"
                  << "7. Unfreeze Account\n"
                  << "8. View Transaction History (any account)\n"
                  << "9. Generate Account Statement (any account)\n"
                  << "0. Logout\n";
        int choice = Utils::readMenuChoice("Select an option: ", 0, 9);

        try {
            switch (choice) {
                case 1: {
                    auto custs = bank.getAllCustomers();
                    if (custs.empty()) { std::cout << "No customers registered yet.\n"; break; }
                    std::cout << std::left << std::setw(12) << "CustID" << std::setw(20) << "Name"
                              << std::setw(15) << "Phone" << "Email\n";
                    for (const auto& c : custs) c.display();
                    break;
                }
                case 2: {
                    auto accs = bank.getAllAccounts();
                    if (accs.empty()) { std::cout << "No accounts yet.\n"; break; }
                    std::cout << std::left << std::setw(14) << "AccNo" << std::setw(14) << "Owner"
                              << std::setw(10) << "Type" << std::right << std::setw(14) << "Balance"
                              << "  Status  Opened\n";
                    for (const auto& a : accs) a.display();
                    break;
                }
                case 3: {
                    std::string custId = Utils::readNonEmptyLine("Customer ID: ");
                    AccountType type = promptAccountType();
                    double deposit = Utils::readPositiveDouble("Initial deposit amount: ");
                    std::string accNo = bank.createAccount(custId, type, deposit);
                    std::cout << "Account created. Account Number: " << accNo << "\n";
                    break;
                }
                case 4: {
                    std::string accNo = Utils::readNonEmptyLine("Account number to delete/close: ");
                    bank.deleteAccount(accNo);
                    std::cout << "Account closed successfully.\n";
                    break;
                }
                case 5: {
                    std::string custId = Utils::readNonEmptyLine("Customer ID: ");
                    std::cout << "(Leave a field blank to keep it unchanged.)\n";
                    std::cout << "Name: "; std::string name; std::getline(std::cin, name);
                    std::cout << "Address: "; std::string addr; std::getline(std::cin, addr);
                    std::cout << "Phone: "; std::string phone; std::getline(std::cin, phone);
                    std::cout << "Email: "; std::string email; std::getline(std::cin, email);
                    bank.modifyCustomerDetails(custId, name, addr, phone, email);
                    std::cout << "Customer updated.\n";
                    break;
                }
                case 6: {
                    std::string accNo = Utils::readNonEmptyLine("Account number to freeze: ");
                    bank.freezeAccount(accNo);
                    std::cout << "Account frozen.\n";
                    break;
                }
                case 7: {
                    std::string accNo = Utils::readNonEmptyLine("Account number to unfreeze: ");
                    bank.unfreezeAccount(accNo);
                    std::cout << "Account unfrozen.\n";
                    break;
                }
                case 8: {
                    std::string accNo = Utils::readNonEmptyLine("Account number: ");
                    auto txns = bank.getTransactionHistory(accNo);
                    if (txns.empty()) { std::cout << "No transactions found.\n"; break; }
                    std::cout << std::left << std::setw(14) << "TxnID" << std::setw(14) << "Account"
                              << std::setw(14) << "Type" << std::right << std::setw(12) << "Amount"
                              << std::setw(14) << "Balance" << "  Timestamp            Description\n";
                    for (const auto& t : txns) t.display();
                    break;
                }
                case 9: {
                    std::string accNo = Utils::readNonEmptyLine("Account number: ");
                    bank.generateStatement(accNo, std::cout);
                    break;
                }
                case 0:
                    std::cout << "Logging out...\n";
                    return;
            }
        } catch (const BankException& e) {
            std::cout << "Error: " << e.what() << "\n";
        }
        pause();
    }
}

// ---------------------------------------------------------------------------
// Registration
// ---------------------------------------------------------------------------

void registerFlow(Bank& bank) {
    printHeader("NEW CUSTOMER REGISTRATION");
    std::string name = Utils::readNonEmptyLine("Full name: ");
    std::cout << "Address: ";
    std::string address; std::getline(std::cin, address);
    std::string phone = Utils::readNonEmptyLine("Phone: ");
    std::string email = Utils::readNonEmptyLine("Email: ");
    std::string password = Utils::readNonEmptyLine("Choose a password: ");

    try {
        std::string id = bank.registerCustomer(name, address, phone, email, password);
        std::cout << "\nRegistration successful! Your Customer ID is: " << id
                  << "\nPlease remember this ID - you will need it to log in.\n";
    } catch (const BankException& e) {
        std::cout << "Error: " << e.what() << "\n";
    }
    pause();
}

// ---------------------------------------------------------------------------
// Top-level menu
// ---------------------------------------------------------------------------

void topLevelMenu(Bank& bank) {
    while (true) {
        printHeader("CODEALPHA BANKING MANAGEMENT SYSTEM");
        std::cout << "1. Customer Login\n"
                  << "2. Register as New Customer\n"
                  << "3. Admin Login\n"
                  << "0. Exit\n";
        int choice = Utils::readMenuChoice("Select an option: ", 0, 3);

        switch (choice) {
            case 1: {
                std::string id = Utils::readNonEmptyLine("Customer ID: ");
                std::string pass = Utils::readNonEmptyLine("Password: ");
                try {
                    Customer* c = bank.customerLogin(id, pass);
                    customerMenu(bank, *c);
                } catch (const BankException& e) {
                    std::cout << "Login failed: " << e.what() << "\n";
                    pause();
                }
                break;
            }
            case 2:
                registerFlow(bank);
                break;
            case 3: {
                std::string user = Utils::readNonEmptyLine("Admin username: ");
                std::string pass = Utils::readNonEmptyLine("Admin password: ");
                if (bank.adminLogin(user, pass)) {
                    adminMenu(bank);
                } else {
                    std::cout << "Invalid admin credentials.\n";
                    pause();
                }
                break;
            }
            case 0:
                std::cout << "\nThank you for using CodeAlpha Banking Management System. Goodbye!\n";
                return;
        }
    }
}

} // namespace

int main() {
    try {
        Bank bank("data");
        topLevelMenu(bank);
    } catch (const std::exception& e) {
        std::cerr << "Fatal error: " << e.what() << "\n";
        return 1;
    }
    return 0;
}
