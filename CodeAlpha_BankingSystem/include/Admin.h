/**
 * @file Admin.h
 * @brief Represents the bank administrator role.
 *
 * The system ships with a single default admin account (see Bank::loadData) that
 * can create/delete/modify accounts, freeze/unfreeze accounts, and view every
 * customer & transaction in the bank. In a production system this would be
 * extended to a full user/role table with proper RBAC.
 */
#ifndef ADMIN_H
#define ADMIN_H

#include <string>

class Admin {
private:
    std::string adminId;
    std::string username;
    std::string passwordHash;

public:
    Admin();
    Admin(const std::string& id, const std::string& username, const std::string& passwordHash);

    std::string getAdminId() const;
    std::string getUsername() const;
    std::string getPasswordHash() const;

    bool authenticate(const std::string& username, const std::string& password) const;
};

#endif // ADMIN_H
