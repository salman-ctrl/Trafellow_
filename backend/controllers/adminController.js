const User = require('../models/User');
const Region = require('../models/Region');
const Destination = require('../models/Destination');
const Event = require('../models/Event');
const DestinationCategory = require('../models/DestinationCategory');
const db = require('../config/database');

// Dashboard Stats
exports.getDashboardStats = async (req, res) => {
  try {
    // Get counts
    const [userCount] = await db.query('SELECT COUNT(*) as count FROM users');
    const [regionCount] = await db.query('SELECT COUNT(*) as count FROM regions');
    const [destinationCount] = await db.query('SELECT COUNT(*) as count FROM destinations');
    const [eventCount] = await db.query('SELECT COUNT(*) as count FROM events');

    // Recent users (last 7 days)
    const [recentUsers] = await db.query(
      `SELECT DATE(created_at) as date, COUNT(*) as count 
       FROM users 
       WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
       GROUP BY DATE(created_at)
       ORDER BY date DESC`
    );

    // Events by region
    const [eventsByRegion] = await db.query(
      `SELECT r.name, COUNT(e.event_id) as count
       FROM regions r
       LEFT JOIN events e ON r.region_id = e.region_id
       GROUP BY r.region_id, r.name
       ORDER BY count DESC`
    );

    // Most viewed destinations
    const [topDestinations] = await db.query(
      `SELECT d.name, d.view_count, r.name as region_name
       FROM destinations d
       JOIN regions r ON d.region_id = r.region_id
       ORDER BY d.view_count DESC
       LIMIT 5`
    );

    // Latest activities
    const [latestUsers] = await db.query(
      'SELECT user_id, name, username, created_at FROM users ORDER BY created_at DESC LIMIT 5'
    );

    const [latestEvents] = await db.query(
      `SELECT e.event_id, e.title, e.created_at, u.name as creator_name
       FROM events e
       JOIN users u ON e.created_by = u.user_id
       ORDER BY e.created_at DESC
       LIMIT 5`
    );

    const [latestDestinations] = await db.query(
      `SELECT d.destination_id, d.name, d.created_at, r.name as region_name
       FROM destinations d
       JOIN regions r ON d.region_id = r.region_id
       ORDER BY d.created_at DESC
       LIMIT 5`
    );

    res.json({
      success: true,
      data: {
        stats: {
          users: userCount[0].count,
          regions: regionCount[0].count,
          destinations: destinationCount[0].count,
          events: eventCount[0].count
        },
        charts: {
          userRegistrations: recentUsers,
          eventsByRegion: eventsByRegion,
          topDestinations: topDestinations
        },
        activities: {
          latestUsers,
          latestEvents,
          latestDestinations
        }
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// User Management
exports.getAllUsersAdmin = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', role = '' } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let query = `SELECT user_id, name, username, email, profile_picture, role, verified, created_at 
                 FROM users WHERE 1=1`;
    const params = [];

    if (search) {
      query += ` AND (name LIKE ? OR username LIKE ? OR email LIKE ?)`;
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    if (role) {
      query += ` AND role = ?`;
      params.push(role);
    }

    query += ` ORDER BY created_at DESC LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), offset);

    const [users] = await db.query(query, params);

    // Get total count
    let countQuery = `SELECT COUNT(*) as total FROM users WHERE 1=1`;
    const countParams = [];

    if (search) {
      countQuery += ` AND (name LIKE ? OR username LIKE ? OR email LIKE ?)`;
      const searchTerm = `%${search}%`;
      countParams.push(searchTerm, searchTerm, searchTerm);
    }

    if (role) {
      countQuery += ` AND role = ?`;
      countParams.push(role);
    }

    const [totalCount] = await db.query(countQuery, countParams);

    res.json({
      success: true,
      data: users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalCount[0].total
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

exports.updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid role' 
      });
    }

    await db.query('UPDATE users SET role = ? WHERE user_id = ?', [role, id]);

    res.json({
      success: true,
      message: 'User role updated successfully'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

exports.toggleUserBan = async (req, res) => {
  try {
    const { id } = req.params;

    const [user] = await db.query('SELECT verified FROM users WHERE user_id = ?', [id]);
    
    if (!user[0]) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    const newStatus = !user[0].verified;
    await db.query('UPDATE users SET verified = ? WHERE user_id = ?', [newStatus, id]);

    res.json({
      success: true,
      message: newStatus ? 'User unbanned successfully' : 'User banned successfully'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Prevent deleting self
    if (parseInt(id) === req.user.user_id) {
      return res.status(400).json({ 
        success: false, 
        message: 'Cannot delete your own account' 
      });
    }

    await db.query('DELETE FROM users WHERE user_id = ?', [id]);

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// Event Management
exports.getAllEventsAdmin = async (req, res) => {
  try {
    const { page = 1, limit = 10, status = '', region_id = '' } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let query = `SELECT e.*, u.name as creator_name, r.name as region_name
                 FROM events e
                 LEFT JOIN users u ON e.created_by = u.user_id
                 LEFT JOIN regions r ON e.region_id = r.region_id
                 WHERE 1=1`;
    const params = [];

    if (status) {
      query += ` AND e.status = ?`;
      params.push(status);
    }

    if (region_id) {
      query += ` AND e.region_id = ?`;
      params.push(region_id);
    }

    query += ` ORDER BY e.created_at DESC LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), offset);

    const [events] = await db.query(query, params);

    // Get total count
    let countQuery = `SELECT COUNT(*) as total FROM events WHERE 1=1`;
    const countParams = [];

    if (status) {
      countQuery += ` AND status = ?`;
      countParams.push(status);
    }

    if (region_id) {
      countQuery += ` AND region_id = ?`;
      countParams.push(region_id);
    }

    const [totalCount] = await db.query(countQuery, countParams);

    res.json({
      success: true,
      data: events,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalCount[0].total
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

exports.cancelEvent = async (req, res) => {
  try {
    const { id } = req.params;

    await db.query(
      'UPDATE events SET status = ?, updated_at = NOW() WHERE event_id = ?',
      ['cancelled', id]
    );

    res.json({
      success: true,
      message: 'Event cancelled successfully'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

exports.deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;

    await db.query('DELETE FROM events WHERE event_id = ?', [id]);

    res.json({
      success: true,
      message: 'Event deleted successfully'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// Tambahkan di dalam adminController.js

exports.getEventDetailAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    const [events] = await db.query(
      `SELECT e.*, 
              u.name as creator_name, 
              r.name as region_name
       FROM events e
       LEFT JOIN users u ON e.created_by = u.user_id
       LEFT JOIN regions r ON e.region_id = r.region_id
       WHERE e.event_id = ?`,
      [id]
    );

    if (events.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Get participants
    const [participants] = await db.query(
      `SELECT u.user_id, u.name, u.username, u.profile_picture, ep.joined_at
       FROM event_participants ep
       JOIN users u ON ep.user_id = u.user_id
       WHERE ep.event_id = ?
       ORDER BY ep.joined_at ASC`,
      [id]
    );

    res.json({
      success: true,
      data: {
        ...events[0],
        participants
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};