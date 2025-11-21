const db = require('../config/database');

class DestinationCategory {
  static async create(categoryData) {
    const { name, slug, description, icon } = categoryData;
    const [result] = await db.query(
      'INSERT INTO destination_categories (name, slug, description, icon) VALUES (?, ?, ?, ?)',
      [name, slug, description, icon]
    );
    return result.insertId;
  }

  static async findById(id) {
    const [rows] = await db.query('SELECT * FROM destination_categories WHERE category_id = ?', [id]);
    return rows[0];
  }

  static async findBySlug(slug) {
    const [rows] = await db.query('SELECT * FROM destination_categories WHERE slug = ?', [slug]);
    return rows[0];
  }

  static async getAll() {
    const [rows] = await db.query('SELECT * FROM destination_categories ORDER BY name ASC');
    return rows;
  }

  static async update(id, categoryData) {
    const fields = [];
    const values = [];

    Object.keys(categoryData).forEach(key => {
      if (categoryData[key] !== undefined) {
        fields.push(`${key} = ?`);
        values.push(categoryData[key]);
      }
    });

    values.push(id);

    const [result] = await db.query(
      `UPDATE destination_categories SET ${fields.join(', ')} WHERE category_id = ?`,
      values
    );
    return result.affectedRows;
  }

  static async delete(id) {
    const [result] = await db.query('DELETE FROM destination_categories WHERE category_id = ?', [id]);
   
  }
}

module.exports = DestinationCategory;