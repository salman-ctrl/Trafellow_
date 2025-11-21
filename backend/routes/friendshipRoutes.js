const express = require('express');
const router = express.Router();
const friendshipController = require('../controllers/friendshipController');
const { authenticate } = require('../middlewares/authMiddleware');

router.post('/request', authenticate, friendshipController.sendFriendRequest);
router.put('/:friendship_id/respond', authenticate, friendshipController.respondFriendRequest);
router.get('/friends', authenticate, friendshipController.getFriends);
router.get('/pending', authenticate, friendshipController.getPendingRequests);
router.delete('/:friendship_id', authenticate, friendshipController.deleteFriendship);

module.exports = router;