const EventParticipant = require('../models/EventParticipant');
const EventChatMessage = require('../models/EventChatMessage');
const DirectMessage = require('../models/DirectMessage');

module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log('🔌 User connected:', socket.id);

    // ===== USER ONLINE =====
    socket.on('userOnline', (userId) => {
      socket.userId = userId;
      socket.join(`user_${userId}`);
      console.log(`✅ User ${userId} is online`);
    });

    // ===== EVENT CHAT =====
    socket.on('join_event_chat', async ({ event_id, user_id }) => {
      try {
        // Check if user is participant
        const isParticipant = await EventParticipant.findByEventAndUser(event_id, user_id);
        
        if (isParticipant) {
          socket.join(`event_${event_id}`);
          console.log(`✅ User ${user_id} joined event chat ${event_id}`);
          
          // Notify other participants
          socket.to(`event_${event_id}`).emit('user_joined_event', {
            event_id,
            user_id,
            user_name: isParticipant.name
          });
        } else {
          console.log(`❌ User ${user_id} is not a participant of event ${event_id}`);
        }
      } catch (error) {
        console.error('❌ Error joining event chat:', error);
      }
    });

    socket.on('send_event_message', async (messageData) => {
      try {
        const message = await EventChatMessage.findById(messageData.message_id);
        
        if (message) {
          // Broadcast to all participants in the event chat room
          io.to(`event_${messageData.event_id}`).emit('new_event_message', message);
          console.log(`📤 Event message sent to event ${messageData.event_id}`);
        }
      } catch (error) {
        console.error('❌ Error sending event message:', error);
      }
    });

    socket.on('leave_event_chat', async (event_id) => {
      socket.leave(`event_${event_id}`);
      console.log(`👋 User left event chat ${event_id}`);
      
      // Notify other participants
      if (socket.userId) {
        socket.to(`event_${event_id}`).emit('user_left_event', {
          event_id,
          user_id: socket.userId
        });
      }
    });

    // ===== DIRECT MESSAGING =====
    socket.on('join_dm', ({ user_id }) => {
      socket.join(`dm_${user_id}`);
      console.log(`✅ User ${user_id} joined DM room`);
    });

    socket.on('send_dm', async (messageData) => {
      try {
        const message = await DirectMessage.findById(messageData.message_id);
        
        if (message) {
          // Send to receiver's DM room
          io.to(`dm_${messageData.receiver_id}`).emit('new_dm', message);
          
          // Send notification to receiver's user room (for global notifications)
          io.to(`user_${messageData.receiver_id}`).emit('new_dm_notification', {
            sender_id: messageData.sender_id,
            sender_name: message.sender_name,
            content: message.content,
            message_id: message.message_id
          });
          
          console.log(`📤 DM sent from ${messageData.sender_id} to ${messageData.receiver_id}`);
        }
      } catch (error) {
        console.error('❌ Error sending DM:', error);
      }
    });

    // ===== USER TYPING (Optional) =====
    socket.on('typing_start', ({ room_type, room_id }) => {
      if (room_type === 'event') {
        socket.to(`event_${room_id}`).emit('user_typing', {
          user_id: socket.userId,
          room_id
        });
      } else if (room_type === 'dm') {
        socket.to(`dm_${room_id}`).emit('user_typing', {
          user_id: socket.userId
        });
      }
    });

    socket.on('typing_stop', ({ room_type, room_id }) => {
      if (room_type === 'event') {
        socket.to(`event_${room_id}`).emit('user_stopped_typing', {
          user_id: socket.userId,
          room_id
        });
      } else if (room_type === 'dm') {
        socket.to(`dm_${room_id}`).emit('user_stopped_typing', {
          user_id: socket.userId
        });
      }
    });

    // ===== USER DISCONNECT =====
    socket.on('disconnect', () => {
      console.log('🔌 User disconnected:', socket.id);
      
      // You can broadcast to all rooms that this user was in
      if (socket.userId) {
        io.emit('user_offline', { user_id: socket.userId });
      }
    });
  });
};