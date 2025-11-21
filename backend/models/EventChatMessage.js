const db = require('../config/database');

class EventChatMessage {
  // === CREATE MESSAGE ===
  static async create(messageData) {
    const { event_id, sender_id, message_type, content, file_url } = messageData;
    const [result] = await db.query(
      `INSERT INTO event_chat_messages 
        (event_id, sender_id, message_type, content, file_url) 
       VALUES (?, ?, ?, ?, ?)`,
      [event_id, sender_id, message_type || 'text', content, file_url]
    );
    return result.insertId;
  }

  // === FIND BY ID ===
  static async findById(id) {
    const [rows] = await db.query(
      `SELECT m.*, 
              u.name AS sender_name, 
              u.username AS sender_username, 
              u.profile_picture AS sender_picture
       FROM event_chat_messages m
       JOIN users u ON m.sender_id = u.user_id
       WHERE m.message_id = ?`,
      [id]
    );
    return rows[0];
  }

  // === GET MESSAGES BY EVENT ID ===
  static async getByEventId(eventId, limit = 100) {
    const [rows] = await db.query(
      `SELECT m.*, 
              u.name AS sender_name, 
              u.username AS sender_username, 
              u.profile_picture AS sender_picture
       FROM event_chat_messages m
       JOIN users u ON m.sender_id = u.user_id
       WHERE m.event_id = ?
       ORDER BY m.sent_at ASC
       LIMIT ?`,
      [eventId, limit]
    );
    return rows;
  }

  // === DELETE MESSAGE ===
  static async delete(id) {
    const [result] = await db.query(
      `DELETE FROM event_chat_messages WHERE message_id = ?`,
      [id]
    );
    return result.affectedRows;
  }

  // === DELETE ALL MESSAGES FOR AN EVENT ===
  static async deleteByEventId(eventId) {
    const [result] = await db.query(
      `DELETE FROM event_chat_messages WHERE event_id = ?`,
      [eventId]
    );
    return result.affectedRows;
  }
}

module.exports = EventChatMessage;