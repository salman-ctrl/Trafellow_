const Region = require('../models/Region');
const path = require('path');
const fs = require('fs');

exports.getAllRegions = async (req, res) => {
  try {
    const regions = await Region.getAll();

    res.json({
      success: true,
      data: regions
    });
  } catch (error) {
    console.error('Error getting regions:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
};

exports.getRegionById = async (req, res) => {
  try {
    const { id } = req.params;
    const region = await Region.findById(id);

    if (!region) {
      return res.status(404).json({ 
        success: false,
        message: 'Region tidak ditemukan' 
      });
    }

    res.json({
      success: true,
      data: region
    });
  } catch (error) {
    console.error('Error getting region:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
};

exports.createRegion = async (req, res) => {
  try {
    const regionData = { ...req.body };

    // ✅ FIX: Handle image upload with FULL PATH
    if (req.file) {
      regionData.image = `/uploads/regions/${req.file.filename}`;
      console.log('Region image uploaded:', regionData.image); // Debug log
    }

    const regionId = await Region.create(regionData);

    res.status(201).json({
      success: true,
      message: 'Region berhasil dibuat',
      data: { region_id: regionId }
    });
  } catch (error) {
    console.error('Error creating region:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error',
      error: error.message // ← TAMBAH INI untuk debugging
    });
  }
};

exports.updateRegion = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    // Get existing region
    const existingRegion = await Region.findById(id);
    if (!existingRegion) {
      return res.status(404).json({
        success: false,
        message: 'Region not found'
      });
    }

    // ✅ FIX: Handle image upload with FULL PATH
    if (req.file) {
      // Delete old image if exists
      if (existingRegion.image) {
        const oldImageFilename = existingRegion.image.replace('/uploads/regions/', '');
        const oldImagePath = path.join(__dirname, '../public/uploads/regions', oldImageFilename);
        if (fs.existsSync(oldImagePath)) {
          try {
            fs.unlinkSync(oldImagePath);
            console.log('Old region image deleted:', oldImagePath);
          } catch (err) {
            console.error('Error deleting old image:', err);
          }
        }
      }
      updateData.image = `/uploads/regions/${req.file.filename}`;
      console.log('Region image updated:', updateData.image); // Debug log
    }

    await Region.update(id, updateData);

    res.json({
      success: true,
      message: 'Region berhasil diupdate'
    });
  } catch (error) {
    console.error('Error updating region:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error',
      error: error.message // ← TAMBAH INI untuk debugging
    });
  }
};

exports.deleteRegion = async (req, res) => {
  try {
    const { id } = req.params;

    // Get existing region
    const region = await Region.findById(id);
    if (!region) {
      return res.status(404).json({
        success: false,
        message: 'Region not found'
      });
    }

    // Delete image if exists
    if (region.image) {
      const imageFilename = region.image.replace('/uploads/regions/', '');
      const imagePath = path.join(__dirname, '../public/uploads/regions', imageFilename);
      if (fs.existsSync(imagePath)) {
        try {
          fs.unlinkSync(imagePath);
          console.log('Region image deleted:', imagePath);
        } catch (err) {
          console.error('Error deleting image:', err);
        }
      }
    }

    await Region.delete(id);

    res.json({
      success: true,
      message: 'Region berhasil dihapus'
    });
  } catch (error) {
    console.error('Error deleting region:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
};