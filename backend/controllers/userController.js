const User = require('../models/User');
const { validationResult } = require('express-validator');

exports.getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const users = await User.getAll(parseInt(limit), offset);

    res.json({
      success: true,
      data: users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit)
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

exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User tidak ditemukan' 
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// ✅ FIX: Update Profile dengan File Upload
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const updateData = {};

    // Get text fields from body
    if (req.body.name) updateData.name = req.body.name;
    if (req.body.bio !== undefined) updateData.bio = req.body.bio;
    if (req.body.location !== undefined) updateData.location = req.body.location;

    // Handle uploaded file
    if (req.file) {
      updateData.profile_picture = `/uploads/profiles/${req.file.filename}`;
    }

    // Update database
    await User.update(userId, updateData);

    // Get updated user data
    const updatedUser = await User.findById(userId);

    res.json({
      success: true,
      message: 'Profile berhasil diupdate',
      data: updatedUser
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error',
      error: error.message
    });
  }
};