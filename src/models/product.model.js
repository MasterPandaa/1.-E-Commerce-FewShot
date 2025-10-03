const db = require('../config/database');
const slugify = require('slugify');

class ProductModel {
  static async create({ name, description = '', price, stock, category, image_url = null }) {
    const slug = slugify(name, { lower: true, strict: true });
    const query = `
      INSERT INTO products (name, slug, description, price, stock, category, image_url, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `;
    const [result] = await db.execute(query, [name, slug, description, price, stock, category, image_url]);
    return { id: result.insertId, name, slug, price, stock, category, image_url };
  }

  static async update(id, fields) {
    const allowed = ['name', 'description', 'price', 'stock', 'category', 'image_url'];
    const sets = [];
    const params = [];

    if (fields.name) {
      sets.push('name = ?');
      params.push(fields.name);
      sets.push('slug = ?');
      params.push(slugify(fields.name, { lower: true, strict: true }));
    }
    for (const key of allowed) {
      if (key !== 'name' && fields[key] !== undefined) {
        sets.push(`${key} = ?`);
        params.push(fields[key]);
      }
    }
    if (sets.length === 0) return false;
    const query = `UPDATE products SET ${sets.join(', ')}, updated_at = NOW() WHERE id = ?`;
    params.push(id);
    const [res] = await db.execute(query, params);
    return res.affectedRows > 0;
  }

  static async updateImage(id, image_url) {
    const [res] = await db.execute('UPDATE products SET image_url = ?, updated_at = NOW() WHERE id = ?', [image_url, id]);
    return res.affectedRows > 0;
  }

  static async delete(id) {
    const [res] = await db.execute('DELETE FROM products WHERE id = ?', [id]);
    return res.affectedRows > 0;
  }

  static async findById(id) {
    const [rows] = await db.execute('SELECT * FROM products WHERE id = ? LIMIT 1', [id]);
    return rows[0];
  }

  static async findBySlug(slug) {
    const [rows] = await db.execute('SELECT * FROM products WHERE slug = ? LIMIT 1', [slug]);
    return rows[0];
  }

  static async list({ page = 1, limit = 12, category, minPrice, maxPrice, q }) {
    const offset = (page - 1) * limit;
    const where = [];
    const params = [];

    if (category) {
      where.push('category = ?');
      params.push(category);
    }
    if (minPrice !== undefined) {
      where.push('price >= ?');
      params.push(minPrice);
    }
    if (maxPrice !== undefined) {
      where.push('price <= ?');
      params.push(maxPrice);
    }
    if (q) {
      where.push('(name LIKE ? OR description LIKE ?)');
      params.push(`%${q}%`, `%${q}%`);
    }

    const whereSql = where.length ? 'WHERE ' + where.join(' AND ') : '';

    const [rows] = await db.execute(
      `SELECT * FROM products ${whereSql} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    const [[{ count }]] = await db.query(`SELECT COUNT(*) as count FROM products ${whereSql}`, params);

    return { rows, total: count };
  }

  static async adjustStock(connection, productId, delta) {
    // delta can be negative for decrement
    const conn = connection || db;
    const [res] = await conn.execute('UPDATE products SET stock = stock + ?, updated_at = NOW() WHERE id = ? AND stock + ? >= 0', [delta, productId, delta]);
    return res.affectedRows > 0;
  }
}

module.exports = ProductModel;
