const express = require('express');
const router = express.Router();
const dmController = require('../controllers/dmController');
const { authenticate } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

router.get('/conversations', authenticate, dmController.getConversationList);
router.get('/conversation/:user_id', authenticate, dmController.getConversation);
router.post('/send', authenticate, upload.single('dm_file'), dmController.sendDirectMessage);

module.exports = router;