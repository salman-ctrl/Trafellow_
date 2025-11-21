const db = require('../config/database');

class User {
  static async create(userData) {
    const { name, username, email, password_hash } = userData;
    const [result] = await db.query(
      'INSERT INTO users (name, username, email, password_hash) VALUES (?, ?, ?, ?)',
      [name, username, email, password_hash]
    );
    return result.insertId;
  }

  static async findByEmail(email) {
    const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0];
  }

  static async findByUsername(username) {
    const [rows] = await db.query('SELECT * FROM users WHERE username = ?', [username]);
    return rows[0];
  }

  static async findById(id) {
    const [rows] = await db.query(
      'SELECT user_id, name, username, email, profile_picture, bio, location, verified, role, created_at FROM users WHERE user_id = ?',
      [id]
    );
    return rows[0];
  }

  static async update(id, userData) {
    const fields = [];
    const values = [];

    if (userData.name) {
      fields.push('name = ?');
      values.push(userData.name);
    }
    if (userData.bio !== undefined) {
      fields.push('bio = ?');
      values.push(userData.bio);
    }
    if (userData.location) {
      fields.push('location = ?');
      values.push(userData.location);
    }
    if (userData.profile_picture) {
      fields.push('profile_picture = ?');
      values.push(userData.profile_picture);
    }

    values.push(id);

    const [result] = await db.query(
      `UPDATE users SET ${fields.join(', ')}, updated_at = NOW() WHERE user_id = ?`,
      values
    );
    return result.affectedRows;
  }

  static async getAll(limit = 10, offset = 0) {
    const [rows] = await db.query(
      'SELECT user_id, name, username, email, profile_picture, location, verified, created_at FROM users LIMIT ? OFFSET ?',
      [limit, offset]
    );
    return rows;
  }
}

module.exports = User;