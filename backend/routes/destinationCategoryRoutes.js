const express = require('express');
const router = express.Router();
const destinationCategoryController = require('../controllers/destinationCategoryController');
const { authenticate, isAdmin } = require('../middlewares/authMiddleware');

// ✅ PUBLIC ROUTES (untuk user biasa)
router.get('/', destinationCategoryController.getAllCategories);
router.get('/:id', destinationCategoryController.getCategoryById);

// ✅ ADMIN ONLY ROUTES (untuk admin)
router.post('/', authenticate, isAdmin, destinationCategoryController.createCategory);
router.put('/:id', authenticate, isAdmin, destinationCategoryController.updateCategory);
router.delete('/:id', authenticate, isAdmin, destinationCategoryController.deleteCategory);

module.exports = router;