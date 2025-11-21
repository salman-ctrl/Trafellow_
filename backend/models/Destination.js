const db = require('../config/database');

class Destination {
  // ✅ Helper function untuk generate slug
  static generateSlug(name) {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-')     // Replace spaces with -
      .replace(/-+/g, '-');     // Replace multiple - with single -
  }

  static async create(destinationData) {
    const {
      name,
      region_id,
      category_id,
      description,
      address,
      latitude,
      longitude,
      ticket_price,
      image,
      created_by
    } = destinationData;

    // ✅ Generate slug from name
    const slug = this.generateSlug(name);

    // ✅ FIX: Tambahkan slug ke query
    const [result] = await db.query(
      `INSERT INTO destinations 
       (name, slug, region_id, category_id, description, address, latitude, longitude, ticket_price, image, created_by, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [name, slug, region_id, category_id, description, address, latitude || null, longitude || null, ticket_price || 0, image, created_by]
    );

    return result.insertId;
  }

  static async update(destinationId, destinationData) {
    const {
      name,
      region_id,
      category_id,
      description,
      address,
      latitude,
      longitude,
      ticket_price,
      image
    } = destinationData;

    // Build SET clause dynamically
    const updates = [];
    const values = [];

    if (name !== undefined) {
      updates.push('name = ?');
      values.push(name);
      // ✅ Update slug juga kalau name berubah
      updates.push('slug = ?');
      values.push(this.generateSlug(name));
    }
    if (region_id !== undefined) {
      updates.push('region_id = ?');
      values.push(region_id);
    }
    if (category_id !== undefined) {
      updates.push('category_id = ?');
      values.push(category_id);
    }
    if (description !== undefined) {
      updates.push('description = ?');
      values.push(description);
    }
    if (address !== undefined) {
      updates.push('address = ?');
      values.push(address);
    }
    if (latitude !== undefined) {
      updates.push('latitude = ?');
      values.push(latitude);
    }
    if (longitude !== undefined) {
      updates.push('longitude = ?');
      values.push(longitude);
    }
    if (ticket_price !== undefined) {
      updates.push('ticket_price = ?');
      values.push(ticket_price || 0);
    }
    if (image !== undefined) {
      updates.push('image = ?');
      values.push(image);
    }

    // Always update timestamp
    updates.push('updated_at = NOW()');

    // Add destination_id to values
    values.push(destinationId);

    const [result] = await db.query(
      `UPDATE destinations SET ${updates.join(', ')} WHERE destination_id = ?`,
      values
    );

    return result.affectedRows;
  }

  static async delete(destinationId) {
    const [result] = await db.query(
      'DELETE FROM destinations WHERE destination_id = ?',
      [destinationId]
    );

    return result.affectedRows;
  }

  static async findById(destinationId) {
    const [rows] = await db.query(
      `SELECT d.*, r.name as region_name, dc.name as category_name, dc.icon as category_icon
       FROM destinations d
       LEFT JOIN regions r ON d.region_id = r.region_id
       LEFT JOIN destination_categories dc ON d.category_id = dc.category_id
       WHERE d.destination_id = ?`,
      [destinationId]
    );

    return rows[0];
  }

  static async findAll(filters = {}) {
    const { region_id, category_id, page = 1, limit = 10 } = filters;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let query = `
      SELECT d.*, r.name as region_name, dc.name as category_name, dc.icon as category_icon
      FROM destinations d
      LEFT JOIN regions r ON d.region_id = r.region_id
      LEFT JOIN destination_categories dc ON d.category_id = dc.category_id
      WHERE 1=1
    `;

    const params = [];

    if (region_id) {
      query += ' AND d.region_id = ?';
      params.push(region_id);
    }

    if (category_id) {
      query += ' AND d.category_id = ?';
      params.push(category_id);
    }

    query += ' ORDER BY d.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const [rows] = await db.query(query, params);
    return rows;
  }

  static async incrementViewCount(destinationId) {
    const [result] = await db.query(
      'UPDATE destinations SET view_count = view_count + 1 WHERE destination_id = ?',
      [destinationId]
    );

    return result.affectedRows;
  }
}

module.exports = Destination;