const db = require('../config/database');

class DirectMessage {
  static async create(messageData) {
    const { sender_id, receiver_id, message_type, content, file_url } = messageData;
    const [result] = await db.query(
      'INSERT INTO direct_messages (sender_id, receiver_id, message_type, content, file_url) VALUES (?, ?, ?, ?, ?)',
      [sender_id, receiver_id, message_type || 'text', content, file_url]
    );
    return result.insertId;
  }

  static async findById(id) {
    const [rows] = await db.query(
      `SELECT m.*, 
              s.name as sender_name, s.username as sender_username, s.profile_picture as sender_picture,
              r.name as receiver_name, r.username as receiver_username, r.profile_picture as receiver_picture
       FROM direct_messages m
       JOIN users s ON m.sender_id = s.user_id
       JOIN users r ON m.receiver_id = r.user_id
       WHERE m.message_id = ?`,
      [id]
    );
    return rows[0];
  }

  static async getConversation(userId1, userId2, limit = 50) {
    const [rows] = await db.query(
      `SELECT m.*, 
              s.name as sender_name, s.username as sender_username, s.profile_picture as sender_picture
       FROM direct_messages m
       JOIN users s ON m.sender_id = s.user_id
       WHERE (m.sender_id = ? AND m.receiver_id = ?) OR (m.sender_id = ? AND m.receiver_id = ?)
       ORDER BY m.sent_at DESC
       LIMIT ?`,
      [userId1, userId2, userId2, userId1, limit]
    );
    return rows.reverse();
  }

  // ✅ FIX: Query yang diperbaiki
  static async getConversationList(userId) {
    const [rows] = await db.query(
      `SELECT 
         contact_user_id AS user_id,
         u.name,
         u.username,
         u.profile_picture,
         last_msg.content AS last_message,
         last_msg.sent_at AS last_message_time,
         last_msg.is_read,
         COALESCE(unread.unread_count, 0) AS unread_count
       FROM (
         SELECT DISTINCT
           CASE 
             WHEN sender_id = ? THEN receiver_id
             ELSE sender_id
           END AS contact_user_id
         FROM direct_messages
         WHERE sender_id = ? OR receiver_id = ?
       ) AS contacts
       JOIN users u ON u.user_id = contacts.contact_user_id
       LEFT JOIN (
         SELECT 
           CASE 
             WHEN sender_id = ? THEN receiver_id
             ELSE sender_id
           END AS contact_id,
           content,
           sent_at,
           is_read,
           message_id
         FROM direct_messages
         WHERE (sender_id = ? OR receiver_id = ?)
         ORDER BY sent_at DESC
       ) AS last_msg ON last_msg.contact_id = contacts.contact_user_id
       LEFT JOIN (
         SELECT 
           sender_id,
           COUNT(*) AS unread_count
         FROM direct_messages
         WHERE receiver_id = ? AND is_read = FALSE
         GROUP BY sender_id
       ) AS unread ON unread.sender_id = contacts.contact_user_id
       GROUP BY 
         contact_user_id,
         u.name,
         u.username,
         u.profile_picture,
         last_msg.content,
         last_msg.sent_at,
         last_msg.is_read,
         last_msg.message_id,
         unread.unread_count
       ORDER BY last_msg.sent_at DESC`,
      [userId, userId, userId, userId, userId, userId, userId]
    );
    return rows;
  }

  static async markAsRead(senderId, receiverId) {
    const [result] = await db.query(
      'UPDATE direct_messages SET is_read = TRUE WHERE sender_id = ? AND receiver_id = ? AND is_read = FALSE',
      [senderId, receiverId]
    );
    return result.affectedRows;
  }

  static async delete(id) {
    const [result] = await db.query('DELETE FROM direct_messages WHERE message_id = ?', [id]);
    return result.affectedRows;
  }
}

module.exports = DirectMessage; 