const db = require('../config/database');

class Region {
  static async create(regionData) {
    const { name, type, description, latitude, longitude, image } = regionData;
    const [result] = await db.query(
      'INSERT INTO regions (name, type, description, latitude, longitude, image) VALUES (?, ?, ?, ?, ?, ?)',
      [name, type, description, latitude, longitude, image]
    );
    return result.insertId;
  }

  static async findById(id) {
    const [rows] = await db.query('SELECT * FROM regions WHERE region_id = ?', [id]);
    return rows[0];
  }

  static async getAll() {
    const [rows] = await db.query('SELECT * FROM regions ORDER BY name ASC');
    return rows;
  }

  static async update(id, regionData) {
    const fields = [];
    const values = [];

    Object.keys(regionData).forEach(key => {
      if (regionData[key] !== undefined) {
        fields.push(`${key} = ?`);
        values.push(regionData[key]);
      }
    });

    values.push(id);

    const [result] = await db.query(
      `UPDATE regions SET ${fields.join(', ')}, updated_at = NOW() WHERE region_id = ?`,
      values
    );
    return result.affectedRows;
  }

  static async delete(id) {
    const [result] = await db.query('DELETE FROM regions WHERE region_id = ?', [id]);
    return result.affectedRows;
  }
}

module.exports = Region;