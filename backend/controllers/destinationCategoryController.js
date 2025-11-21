const DestinationCategory = require('../models/DestinationCategory');

const getAllCategories = async (req, res) => {
  try {
    const categories = await DestinationCategory.getAll();
    res.status(200).json({ success: true, data: categories });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ success: false, message: 'Gagal mengambil data kategori destinasi' });
  }
};

const getCategoryById = async (req, res) => {
  try {
    const category = await DestinationCategory.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Kategori destinasi tidak ditemukan' });
    }
    res.status(200).json({ success: true, data: category });
  } catch (error) {
    console.error('Error fetching category:', error);
    res.status(500).json({ success: false, message: 'Gagal mengambil data kategori destinasi' });
  }
};

const getCategoryBySlug = async (req, res) => {
  try {
    const category = await DestinationCategory.findBySlug(req.params.slug);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Kategori destinasi tidak ditemukan' });
    }
    res.status(200).json({ success: true, data: category });
  } catch (error) {
    console.error('Error fetching category by slug:', error);
    res.status(500).json({ success: false, message: 'Gagal mengambil data kategori destinasi' });
  }
};

const createCategory = async (req, res) => {
  try {
    const { name, slug, description, icon } = req.body;
    if (!name || !slug) {
      return res.status(400).json({ success: false, message: 'Nama dan slug kategori wajib diisi' });
    }
    const existingCategory = await DestinationCategory.findBySlug(slug);
    if (existingCategory) {
      return res.status(400).json({ success: false, message: 'Slug kategori sudah digunakan' });
    }
    const categoryId = await DestinationCategory.create({ name, slug, description, icon });
    const category = await DestinationCategory.findById(categoryId);
    res.status(201).json({ success: true, message: 'Kategori destinasi berhasil dibuat', data: category });
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ success: false, message: 'Gagal membuat kategori destinasi' });
  }
};

const updateCategory = async (req, res) => {
  try {
    const { name, slug, description, icon } = req.body;
    const category = await DestinationCategory.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Kategori destinasi tidak ditemukan' });
    }
    if (slug && slug !== category.slug) {
      const existingCategory = await DestinationCategory.findBySlug(slug);
      if (existingCategory) {
        return res.status(400).json({ success: false, message: 'Slug kategori sudah digunakan' });
      }
    }
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (slug !== undefined) updateData.slug = slug;
    if (description !== undefined) updateData.description = description;
    if (icon !== undefined) updateData.icon = icon;
    await DestinationCategory.update(req.params.id, updateData);
    const updatedCategory = await DestinationCategory.findById(req.params.id);
    res.status(200).json({ success: true, message: 'Kategori destinasi berhasil diperbarui', data: updatedCategory });
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({ success: false, message: 'Gagal memperbarui kategori destinasi' });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const category = await DestinationCategory.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Kategori destinasi tidak ditemukan' });
    }
    await DestinationCategory.delete(req.params.id);
    res.status(200).json({ success: true, message: 'Kategori destinasi berhasil dihapus' });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ success: false, message: 'Gagal menghapus kategori destinasi' });
  }
};

module.exports = {
  getAllCategories,
  getCategoryById,
  getCategoryBySlug,
  createCategory,
  updateCategory,
  deleteCategory
};