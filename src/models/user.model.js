const db = require("../config/database");
const bcrypt = require("bcrypt");

class UserModel {
  static async create({ email, password, name, role = "user" }) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const query = `
      INSERT INTO users (email, password, name, role, created_at, updated_at)
      VALUES (?, ?, ?, ?, NOW(), NOW())
    `;
    const [result] = await db.execute(query, [
      email,
      hashedPassword,
      name,
      role,
    ]);
    return { id: result.insertId, email, name, role };
  }

  static async findByEmail(email) {
    const query =
      "SELECT id, email, password, name, role, created_at, updated_at FROM users WHERE email = ? LIMIT 1";
    const [rows] = await db.execute(query, [email]);
    return rows[0];
  }

  static async findById(id) {
    const query =
      "SELECT id, email, name, role, created_at, updated_at FROM users WHERE id = ? LIMIT 1";
    const [rows] = await db.execute(query, [id]);
    return rows[0];
  }

  static async updateProfile(id, { name }) {
    const query = "UPDATE users SET name = ?, updated_at = NOW() WHERE id = ?";
    const [result] = await db.execute(query, [name, id]);
    return result.affectedRows > 0;
  }

  static async updatePassword(id, newPassword) {
    const hashed = await bcrypt.hash(newPassword, 10);
    const query =
      "UPDATE users SET password = ?, updated_at = NOW() WHERE id = ?";
    const [result] = await db.execute(query, [hashed, id]);
    return result.affectedRows > 0;
  }

  static async listUsers({ page = 1, limit = 20 }) {
    const offset = (page - 1) * limit;
    const [rows] = await db.execute(
      "SELECT id, email, name, role, created_at FROM users ORDER BY created_at DESC LIMIT ? OFFSET ?",
      [limit, offset],
    );
    const [[{ count }]] = await db.query("SELECT COUNT(*) as count FROM users");
    return { rows, total: count };
  }

  static async updateRole(id, role) {
    const [res] = await db.execute(
      "UPDATE users SET role = ?, updated_at = NOW() WHERE id = ?",
      [role, id],
    );
    return res.affectedRows > 0;
  }
}

module.exports = UserModel;
