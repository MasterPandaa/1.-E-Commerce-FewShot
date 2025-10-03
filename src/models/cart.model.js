const db = require("../config/database");

class CartModel {
  static async getItems(userId) {
    const [rows] = await db.execute(
      `SELECT c.product_id, c.quantity, p.name, p.price, p.stock, p.image_url
       FROM cart_items c
       JOIN products p ON p.id = c.product_id
       WHERE c.user_id = ?
       ORDER BY c.updated_at DESC`,
      [userId],
    );
    return rows;
  }

  static async addOrUpdate(userId, productId, quantity) {
    const [res] = await db.execute(
      `INSERT INTO cart_items (user_id, product_id, quantity, created_at, updated_at)
       VALUES (?, ?, ?, NOW(), NOW())
       ON DUPLICATE KEY UPDATE quantity = quantity + VALUES(quantity), updated_at = NOW()`,
      [userId, productId, quantity],
    );
    return res.affectedRows > 0;
  }

  static async setQuantity(userId, productId, quantity) {
    if (quantity <= 0) {
      const [res] = await db.execute(
        "DELETE FROM cart_items WHERE user_id = ? AND product_id = ?",
        [userId, productId],
      );
      return res.affectedRows > 0;
    }
    const [res] = await db.execute(
      "UPDATE cart_items SET quantity = ?, updated_at = NOW() WHERE user_id = ? AND product_id = ?",
      [quantity, userId, productId],
    );
    return res.affectedRows > 0;
  }

  static async removeItem(userId, productId) {
    const [res] = await db.execute(
      "DELETE FROM cart_items WHERE user_id = ? AND product_id = ?",
      [userId, productId],
    );
    return res.affectedRows > 0;
  }

  static async clear(userId) {
    const [res] = await db.execute("DELETE FROM cart_items WHERE user_id = ?", [
      userId,
    ]);
    return res.affectedRows > 0;
  }
}

module.exports = CartModel;
