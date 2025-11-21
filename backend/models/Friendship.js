const db = require('../config/database');

class Friendship {
  static async sendRequest(userId, friendId) {
    const [result] = await db.query(
      'INSERT INTO friendships (user_id, friend_id, status) VALUES (?, ?, "pending")',
      [userId, friendId]
    );
    return result.insertId;
  }

  static async findRequest(userId, friendId) {
    const [rows] = await db.query(
      'SELECT * FROM friendships WHERE (user_id = ? AND friend_id = ?) OR (user_id = ? AND friend_id = ?)',
      [userId, friendId, friendId, userId]
    );
    return rows[0];
  }

  static async updateStatus(friendshipId, status) {
    const [result] = await db.query(
      'UPDATE friendships SET status = ?, updated_at = NOW() WHERE friendship_id = ?',
      [status, friendshipId]
    );
    return result.affectedRows;
  }

  static async getFriendsByUserId(userId) {
    const [rows] = await db.query(
      `SELECT u.user_id, u.name, u.username, u.profile_picture, u.location, f.status
       FROM friendships f
       JOIN users u ON (f.friend_id = u.user_id AND f.user_id = ?)
       WHERE f.status = 'accepted'
       UNION
       SELECT u.user_id, u.name, u.username, u.profile_picture, u.location, f.status
       FROM friendships f
       JOIN users u ON (f.user_id = u.user_id AND f.friend_id = ?)
       WHERE f.status = 'accepted'`,
      [userId, userId]
    );
    return rows;
  }

  static async getPendingRequests(userId) {
    const [rows] = await db.query(
      `SELECT f.friendship_id, u.user_id, u.name, u.username, u.profile_picture, f.created_at
       FROM friendships f
       JOIN users u ON f.user_id = u.user_id
       WHERE f.friend_id = ? AND f.status = 'pending'`,
      [userId]
    );
    return rows;
  }

  static async delete(friendshipId) {
    const [result] = await db.query('DELETE FROM friendships WHERE friendship_id = ?', [friendshipId]);
    return result.affectedRows;
  }
}

module.exports = Friendship;