const Destination = require('../models/Destination');
const path = require('path');
const fs = require('fs');

exports.createDestination = async (req, res) => {
  try {
    console.log('📥 Request body:', req.body); // ← TAMBAH LOG
    console.log('📁 Request file:', req.file); // ← TAMBAH LOG

    const {
      name,
      region_id,
      category_id,
      description,
      address,
      latitude,
      longitude,
      ticket_price
    } = req.body;

    // Validate required fields
    if (!name || !region_id || !category_id || !description || !address) {
      return res.status(400).json({
        success: false,
        message: 'Name, region, category, description, and address are required'
      });
    }

    // Handle image upload with FULL PATH
    let imagePath = null;
    if (req.file) {
      imagePath = `/uploads/destinations/${req.file.filename}`;
      console.log('✅ Destination image uploaded:', imagePath); // ← TAMBAH LOG
    }

    const destinationData = {
      name,
      region_id,
      category_id,
      description,
      address,
      latitude: latitude || null,
      longitude: longitude || null,
      ticket_price: ticket_price || 0,
      image: imagePath,
      created_by: req.user?.user_id || null
    };

    console.log('📤 Creating destination with data:', destinationData); // ← TAMBAH LOG

    const destinationId = await Destination.create(destinationData);

    console.log('✅ Destination created with ID:', destinationId); // ← TAMBAH LOG

    res.status(201).json({
      success: true,
      message: 'Destination created successfully',
      data: { destination_id: destinationId }
    });
  } catch (error) {
    console.error('❌ Error creating destination:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error',
      error: error.message
    });
  }
};

exports.updateDestination = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      region_id,
      category_id,
      description,
      address,
      latitude,
      longitude,
      ticket_price
    } = req.body;

    // Check if destination exists
    const existingDestination = await Destination.findById(id);
    if (!existingDestination) {
      return res.status(404).json({
        success: false,
        message: 'Destination not found'
      });
    }

    // Build update data object
    const updateData = {};

    if (name) updateData.name = name;
    if (region_id) updateData.region_id = region_id;
    if (category_id) updateData.category_id = category_id;
    if (description) updateData.description = description;
    if (address) updateData.address = address;
    if (latitude !== undefined) updateData.latitude = latitude || null;
    if (longitude !== undefined) updateData.longitude = longitude || null;
    if (ticket_price !== undefined) updateData.ticket_price = ticket_price || 0;

    // Handle image upload with FULL PATH
    if (req.file) {
      // Delete old image if exists
      if (existingDestination.image) {
        const oldImageFilename = existingDestination.image.replace('/uploads/destinations/', '');
        const oldImagePath = path.join(__dirname, '../public/uploads/destinations', oldImageFilename);
        if (fs.existsSync(oldImagePath)) {
          try {
            fs.unlinkSync(oldImagePath);
            console.log('✅ Old image deleted:', oldImagePath);
          } catch (err) {
            console.error('❌ Error deleting old image:', err);
          }
        }
      }
      updateData.image = `/uploads/destinations/${req.file.filename}`;
      console.log('✅ New image uploaded:', updateData.image);
    }

    await Destination.update(id, updateData);

    res.json({
      success: true,
      message: 'Destination updated successfully'
    });
  } catch (error) {
    console.error('❌ Error updating destination:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error',
      error: error.message
    });
  }
};

exports.deleteDestination = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if destination exists
    const destination = await Destination.findById(id);
    if (!destination) {
      return res.status(404).json({
        success: false,
        message: 'Destination not found'
      });
    }

    // Delete image if exists
    if (destination.image) {
      const imageFilename = destination.image.replace('/uploads/destinations/', '');
      const imagePath = path.join(__dirname, '../public/uploads/destinations', imageFilename);
      if (fs.existsSync(imagePath)) {
        try {
          fs.unlinkSync(imagePath);
          console.log('✅ Image deleted:', imagePath);
        } catch (err) {
          console.error('❌ Error deleting image:', err);
        }
      }
    }

    await Destination.delete(id);

    res.json({
      success: true,
      message: 'Destination deleted successfully'
    });
  } catch (error) {
    console.error('❌ Error deleting destination:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

exports.getDestinationById = async (req, res) => {
  try {
    const { id } = req.params;

    const destination = await Destination.findById(id);
    if (!destination) {
      return res.status(404).json({
        success: false,
        message: 'Destination not found'
      });
    }

    // Increment view count
    await Destination.incrementViewCount(id);

    res.json({
      success: true,
      data: destination
    });
  } catch (error) {
    console.error('❌ Error getting destination:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

exports.getAllDestinations = async (req, res) => {
  try {
    const { region_id, category_id, page = 1, limit = 10 } = req.query;

    const destinations = await Destination.findAll({
      region_id,
      category_id,
      page,
      limit
    });

    // Get total count for pagination
    let countQuery = 'SELECT COUNT(*) as total FROM destinations WHERE 1=1';
    const countParams = [];

    if (region_id) {
      countQuery += ' AND region_id = ?';
      countParams.push(region_id);
    }

    if (category_id) {
      countQuery += ' AND category_id = ?';
      countParams.push(category_id);
    }

    const db = require('../config/database');
    const [totalCount] = await db.query(countQuery, countParams);

    res.json({
      success: true,
      data: destinations,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalCount[0].total
      }
    });
  } catch (error) {
    console.error('❌ Error getting destinations:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};