const express = require('express');
const router = express.Router();
const destinationController = require('../controllers/destinationController');
const { authenticate, isAdmin } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

// Public routes
router.get('/', destinationController.getAllDestinations);
router.get('/:id', destinationController.getDestinationById);

// Protected routes (ADMIN ONLY)
router.post('/', 
  authenticate,
  isAdmin, // ← TAMBAH INI!
  upload.single('destination_image'),
  destinationController.createDestination
);

router.put('/:id', 
  authenticate,
  isAdmin, // ← TAMBAH INI!
  upload.single('destination_image'),
  destinationController.updateDestination
);

router.delete('/:id', 
  authenticate,
  isAdmin, // ← TAMBAH INI!
  destinationController.deleteDestination
);

module.exports = router;