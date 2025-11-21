const db = require('../config/database');

class EventParticipant {
  static async create(participantData) {
    const { event_id, user_id, status = 'registered' } = participantData;
    const [result] = await db.query(
      'INSERT INTO event_participants (event_id, user_id, status) VALUES (?, ?, ?)',
      [event_id, user_id, status]
    );
    return result.insertId;
  }

  static async findByEventAndUser(eventId, userId) {
    const [rows] = await db.query(
      'SELECT * FROM event_participants WHERE event_id = ? AND user_id = ?',
      [eventId, userId]
    );
    return rows[0];
  }

  static async getByEventId(eventId) {
    const [rows] = await db.query(
      `SELECT ep.*, u.user_id, u.name, u.username, u.profile_picture
       FROM event_participants ep
       JOIN users u ON ep.user_id = u.user_id
       WHERE ep.event_id = ? AND ep.status != 'cancelled'
       ORDER BY ep.joined_at ASC`,
      [eventId]
    );
    return rows;
  }

  static async getByUserId(userId) {
    const [rows] = await db.query(
      `SELECT ep.*, e.title, e.event_date, e.event_time, e.image
       FROM event_participants ep
       JOIN events e ON ep.event_id = e.event_id
       WHERE ep.user_id = ? AND ep.status != 'cancelled'
       ORDER BY e.event_date ASC`,
      [userId]
    );
    return rows;
  }

  static async updateStatus(eventId, userId, status) {
    const [result] = await db.query(
      'UPDATE event_participants SET status = ? WHERE event_id = ? AND user_id = ?',
      [status, eventId, userId]
    );
    return result.affectedRows;
  }

  static async delete(eventId, userId) {
    const [result] = await db.query(
      'DELETE FROM event_participants WHERE event_id = ? AND user_id = ?',
      [eventId, userId]
    );
    return result.affectedRows;
  }
}

module.exports = EventParticipant;