const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const { authenticate } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');
const { createEventValidation } = require('../validators/eventValidator');

router.get('/', eventController.getAllEvents);
router.get('/my-events', authenticate, eventController.getMyEvents);
router.get('/:id', eventController.getEventById);
router.post('/', authenticate, upload.single('event_image'), createEventValidation, eventController.createEvent);
router.post('/:id/join', authenticate, eventController.joinEvent);
router.post('/:id/leave', authenticate, eventController.leaveEvent);
router.put('/:id', authenticate, upload.single('event_image'), eventController.updateEvent);
router.delete('/:id', authenticate, eventController.deleteEvent);

module.exports = router;