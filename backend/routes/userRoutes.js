const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');
const { updateProfileValidation } = require('../validators/userValidator');

router.get('/', userController.getAllUsers);
router.get('/:id', userController.getUserById);
router.put('/profile', authenticate, upload.single('profile_picture'), updateProfileValidation, userController.updateProfile);

module.exports = router;