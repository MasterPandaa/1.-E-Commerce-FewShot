const db = require("../config/database");

class PasswordResetModel {
  static async create({ userId, tokenHash, expiresAt }) {
    const query = `
      INSERT INTO password_reset_tokens (user_id, token_hash, expires_at, created_at)
      VALUES (?, ?, ?, NOW())
    `;
    const [res] = await db.execute(query, [userId, tokenHash, expiresAt]);
    return res.insertId;
  }

  static async findValidByHash(tokenHash) {
    const query = `
      SELECT * FROM password_reset_tokens
      WHERE token_hash = ? AND expires_at > NOW()
      ORDER BY created_at DESC
      LIMIT 1
    `;
    const [rows] = await db.execute(query, [tokenHash]);
    return rows[0];
  }

  static async consume(id) {
    const [res] = await db.execute(
      "DELETE FROM password_reset_tokens WHERE id = ?",
      [id],
    );
    return res.affectedRows > 0;
  }

  static async deleteByUser(userId) {
    const [res] = await db.execute(
      "DELETE FROM password_reset_tokens WHERE user_id = ?",
      [userId],
    );
    return res.affectedRows > 0;
  }
}

module.exports = PasswordResetModel;
