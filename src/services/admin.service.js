const UserModel = require("../models/user.model");

async function listUsers({ page = 1, limit = 20 }) {
  return await UserModel.listUsers({ page, limit });
}

async function updateUserRole(userId, role) {
  return await UserModel.updateRole(userId, role);
}

module.exports = {
  listUsers,
  updateUserRole,
};
