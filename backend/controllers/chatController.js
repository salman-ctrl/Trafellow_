const EventChatMessage = require('../models/EventChatMessage');
const EventParticipant = require('../models/EventParticipant');

exports.getEventChatMessages = async (req, res) => {
  try {
    const { event_id } = req.params;
    const userId = req.user.user_id;

    const isParticipant = await EventParticipant.findByEventAndUser(event_id, userId);
    if (!isParticipant) {
      return res.status(403).json({ 
        success: false, 
        message: 'Anda bukan peserta event ini' 
      });
    }

    const messages = await EventChatMessage.getByEventId(event_id);

    res.json({
      success: true,
      data: messages
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

exports.sendEventChatMessage = async (req, res) => {
  try {
    const { event_id } = req.params;
    const { content, message_type } = req.body;
    const userId = req.user.user_id;

    const isParticipant = await EventParticipant.findByEventAndUser(event_id, userId);
    if (!isParticipant) {
      return res.status(403).json({ 
        success: false, 
        message: 'Anda bukan peserta event ini' 
      });
    }

    const messageData = {
      event_id,
      sender_id: userId,
      content,
      message_type: message_type || 'text',
      file_url: req.file ? `/uploads/chat/${req.file.filename}` : null
    };

    const messageId = await EventChatMessage.create(messageData);

    res.status(201).json({
      success: true,
      message: 'Pesan berhasil dikirim',
      data: { message_id: messageId }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};