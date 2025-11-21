const db = require('../config/database');

class Event {
  static async create(eventData) {
    const {
      created_by, destination_id, region_id, title, slug, description,
      event_date, event_time, meeting_point, latitude, longitude,
      max_participants, image
    } = eventData;

    const [result] = await db.query(
      `INSERT INTO events (created_by, destination_id, region_id, title, slug, description, event_date, event_time, meeting_point, latitude, longitude, max_participants, image)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [created_by, destination_id, region_id, title, slug, description, event_date, event_time, meeting_point, latitude, longitude, max_participants, image]
    );
    return result.insertId;
  }

  static async findById(id) {
    const [rows] = await db.query(
      `SELECT e.*, u.name as creator_name, u.username as creator_username,
              d.name as destination_name, r.name as region_name
       FROM events e
       LEFT JOIN users u ON e.created_by = u.user_id
       LEFT JOIN destinations d ON e.destination_id = d.destination_id
       LEFT JOIN regions r ON e.region_id = r.region_id
       WHERE e.event_id = ?`,
      [id]
    );
    return rows[0];
  }

  static async getAll(filters = {}) {
    let query = `SELECT e.*, u.name as creator_name, r.name as region_name
                 FROM events e
                 LEFT JOIN users u ON e.created_by = u.user_id
                 LEFT JOIN regions r ON e.region_id = r.region_id
                 WHERE 1=1`;
    const params = [];

    if (filters.region_id) {
      query += ' AND e.region_id = ?';
      params.push(filters.region_id);
    }

    if (filters.status) {
      query += ' AND e.status = ?';
      params.push(filters.status);
    }

    if (filters.upcoming) {
      query += ' AND e.event_date >= CURDATE()';
    }

    query += ' ORDER BY e.event_date ASC, e.event_time ASC LIMIT ? OFFSET ?';
    params.push(filters.limit || 10, filters.offset || 0);

    const [rows] = await db.query(query, params);
    return rows;
  }

  static async updateStatus(id, status) {
    const [result] = await db.query(
      'UPDATE events SET status = ?, updated_at = NOW() WHERE event_id = ?',
      [status, id]
    );
    return result.affectedRows;
  }

  static async incrementParticipants(id) {
    const [result] = await db.query(
      'UPDATE events SET current_participants = current_participants + 1, updated_at = NOW() WHERE event_id = ?',
      [id]
    );
    return result.affectedRows;
  }

  static async decrementParticipants(id) {
    const [result] = await db.query(
      'UPDATE events SET current_participants = current_participants - 1, updated_at = NOW() WHERE event_id = ?',
      [id]
    );
    return result.affectedRows;
  }

  static async update(id, eventData) {
    const fields = [];
    const values = [];

    Object.keys(eventData).forEach(key => {
      if (eventData[key] !== undefined) {
        fields.push(`${key} = ?`);
        values.push(eventData[key]);
      }
    });

    values.push(id);

    const [result] = await db.query(
      `UPDATE events SET ${fields.join(', ')}, updated_at = NOW() WHERE event_id = ?`,
      values
    );
    return result.affectedRows;
  }

  static async delete(id) {
    const [result] = await db.query('DELETE FROM events WHERE event_id = ?', [id]);
    return result.affectedRows;
  }
}

module.exports = Event;