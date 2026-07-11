/**
 * @file Admin.cpp
 * @brief Implementation of the Admin class.
 */
#include "Admin.h"
#include "Utils.h"

Admin::Admin() = default;

Admin::Admin(const std::string& id, const std::string& username, const std::string& passwordHash)
    : adminId(id), username(username), passwordHash(passwordHash) {}

std::string Admin::getAdminId() const { return adminId; }
std::string Admin::getUsername() const { return username; }
std::string Admin::getPasswordHash() const { return passwordHash; }

bool Admin::authenticate(const std::string& enteredUsername, const std::string& password) const {
    return enteredUsername == username && Utils::hashPassword(password) == passwordHash;
}
