const db = require("../config/database");

class OrderModel {
  static async createOrder(
    connection,
    {
      userId,
      address,
      city,
      postalCode,
      country,
      totalAmount,
      paymentMethod,
      status = "pending",
    },
  ) {
    const conn = connection || db;
    const [res] = await conn.execute(
      `INSERT INTO orders (user_id, address, city, postal_code, country, total_amount, payment_method, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        userId,
        address,
        city,
        postalCode,
        country,
        totalAmount,
        paymentMethod,
        status,
      ],
    );
    return res.insertId;
  }

  static async addOrderItem(
    connection,
    { orderId, productId, name, price, quantity },
  ) {
    const conn = connection || db;
    const [res] = await conn.execute(
      `INSERT INTO order_items (order_id, product_id, name, price, quantity)
       VALUES (?, ?, ?, ?, ?)`,
      [orderId, productId, name, price, quantity],
    );
    return res.insertId;
  }

  static async updateStatus(connection, orderId, status, paymentTxnId = null) {
    const conn = connection || db;
    const [res] = await conn.execute(
      "UPDATE orders SET status = ?, payment_txn_id = ?, updated_at = NOW() WHERE id = ?",
      [status, paymentTxnId, orderId],
    );
    return res.affectedRows > 0;
  }

  static async getById(orderId) {
    const [rows] = await db.execute(
      "SELECT * FROM orders WHERE id = ? LIMIT 1",
      [orderId],
    );
    return rows[0];
  }

  static async getItems(orderId) {
    const [rows] = await db.execute(
      "SELECT * FROM order_items WHERE order_id = ?",
      [orderId],
    );
    return rows;
  }

  static async list({ page = 1, limit = 20, status }) {
    const offset = (page - 1) * limit;
    const where = [];
    const params = [];
    if (status) {
      where.push("status = ?");
      params.push(status);
    }
    const whereSql = where.length ? "WHERE " + where.join(" AND ") : "";

    const [rows] = await db.execute(
      `SELECT o.*, u.email, u.name
       FROM orders o JOIN users u ON u.id = o.user_id
       ${whereSql}
       ORDER BY o.created_at DESC LIMIT ? OFFSET ?`,
      [...params, limit, offset],
    );
    const [[{ count }]] = await db.query(
      `SELECT COUNT(*) as count FROM orders ${whereSql}`,
      params,
    );
    return { rows, total: count };
  }

  static async listByUser(userId, { page = 1, limit = 20 }) {
    const offset = (page - 1) * limit;
    const [rows] = await db.execute(
      "SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?",
      [userId, limit, offset],
    );
    const [[{ count }]] = await db.query(
      "SELECT COUNT(*) as count FROM orders WHERE user_id = ?",
      [userId],
    );
    return { rows, total: count };
  }

  static async statsOverview() {
    const [[{ total_users }]] = await db.query(
      "SELECT COUNT(*) AS total_users FROM users",
    );
    const [[{ total_products }]] = await db.query(
      "SELECT COUNT(*) AS total_products FROM products",
    );
    const [[{ total_orders }]] = await db.query(
      "SELECT COUNT(*) AS total_orders FROM orders",
    );
    const [[{ total_revenue }]] = await db.query(
      "SELECT IFNULL(SUM(total_amount),0) AS total_revenue FROM orders WHERE status IN ('paid','shipped','completed')",
    );
    return { total_users, total_products, total_orders, total_revenue };
  }

  static async statsSales(rangeDays = 7) {
    const [rows] = await db.execute(
      `SELECT DATE(created_at) AS day, SUM(total_amount) AS revenue, COUNT(*) AS orders
       FROM orders
       WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL ? DAY) AND status IN ('paid','shipped','completed')
       GROUP BY DATE(created_at)
       ORDER BY day ASC`,
      [rangeDays],
    );
    return rows;
  }

  static async statsTopProducts(limit = 5) {
    const [rows] = await db.execute(
      `SELECT oi.product_id, oi.name, SUM(oi.quantity) AS qty, SUM(oi.price * oi.quantity) AS revenue
       FROM order_items oi
       JOIN orders o ON o.id = oi.order_id
       WHERE o.status IN ('paid','shipped','completed')
       GROUP BY oi.product_id, oi.name
       ORDER BY revenue DESC
       LIMIT ?`,
      [limit],
    );
    return rows;
  }
}

module.exports = OrderModel;
