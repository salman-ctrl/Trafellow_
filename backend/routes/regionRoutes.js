const express = require('express');
const router = express.Router();
const regionController = require('../controllers/regionController');
const { authenticate, isAdmin } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

// Public routes
router.get('/', regionController.getAllRegions);
router.get('/:id', regionController.getRegionById);

// Protected routes (admin only)
router.post('/', 
  authenticate, 
  isAdmin, 
  upload.single('region_image'),  // ← PASTIKAN INI ADA
  regionController.createRegion
);

router.put('/:id', 
  authenticate, 
  isAdmin, 
  upload.single('region_image'),  // ← PASTIKAN INI ADA
  regionController.updateRegion
);

router.delete('/:id', 
  authenticate, 
  isAdmin, 
  regionController.deleteRegion
);

module.exports = router;