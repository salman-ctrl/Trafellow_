const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticate, isAdmin } = require('../middlewares/authMiddleware');

// All routes require admin authentication
router.use(authenticate);
router.use(isAdmin);

// Dashboard
router.get('/stats', adminController.getDashboardStats);

// User Management
router.get('/users', adminController.getAllUsersAdmin);
router.put('/users/:id/role', adminController.updateUserRole);
router.put('/users/:id/ban', adminController.toggleUserBan);
router.delete('/users/:id', adminController.deleteUser);

// Event Management (Admin specific)
router.get('/events', adminController.getAllEventsAdmin);
router.get('/events/:id', adminController.getEventDetailAdmin); // ← Detail untuk admin
router.put('/events/:id/cancel', adminController.cancelEvent);
router.delete('/events/:id', adminController.deleteEvent);

module.exports = router;