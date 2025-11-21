const DirectMessage = require('../models/DirectMessage');
const Friendship = require('../models/Friendship');

exports.getConversation = async (req, res) => {
  try {
    const { user_id } = req.params;
    const myUserId = req.user.user_id;

    const messages = await DirectMessage.getConversation(myUserId, user_id);

    await DirectMessage.markAsRead(user_id, myUserId);

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

exports.sendDirectMessage = async (req, res) => {
  try {
    const { receiver_id, content, message_type } = req.body;
    const senderId = req.user.user_id;

    const messageData = {
      sender_id: senderId,
      receiver_id,
      content,
      message_type: message_type || 'text',
      file_url: req.file ? `/uploads/dm/${req.file.filename}` : null
    };

    const messageId = await DirectMessage.create(messageData);

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

exports.getConversationList = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const conversations = await DirectMessage.getConversationList(userId);

    res.json({
      success: true,
      data: conversations
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};