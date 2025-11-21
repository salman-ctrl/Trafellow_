const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const { authenticate } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

router.get('/event/:event_id', authenticate, chatController.getEventChatMessages);
router.post('/event/:event_id', authenticate, upload.single('chat_file'), chatController.sendEventChatMessage);

module.exports = router;