"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import Navbar from "@/components/layout/Nav";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import api from "@/lib/api";
import { getImageUrl } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { useSocket } from "@/context/SocketContext";
import toast from "react-hot-toast";
import { 
  Send, ArrowLeft, Users, Info, Paperclip, 
  Image as ImageIcon, MoreVertical, Calendar 
} from "lucide-react";

function EventChatContent() {
  const router = useRouter();
  const params = useParams();
  const { id: eventId } = params;
  const { user } = useAuth();
  const { socket, isConnected } = useSocket();
  
  const [event, setEvent] = useState(null);
  const [messages, setMessages] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [showParticipants, setShowParticipants] = useState(false);
  
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (eventId) {
      fetchEventInfo();
      fetchMessages();
    }
  }, [eventId]);

  useEffect(() => {
    if (socket && isConnected && eventId && user) {
      // Join event chat room
      socket.emit('join_event_chat', { 
        event_id: parseInt(eventId), 
        user_id: user.user_id 
      });

      console.log(`Joined event chat: ${eventId}`);

      // Listen for new messages
      socket.on('new_event_message', (message) => {
        console.log('New event message received:', message);
        
        // Only add if it's for this event
        if (message.event_id === parseInt(eventId)) {
          setMessages(prev => {
            // Check if message already exists
            const exists = prev.some(m => m.message_id === message.message_id);
            if (exists) return prev;
            return [...prev, message];
          });
          scrollToBottom();
        }
      });

      // Listen for user joined/left
      socket.on('user_joined_event', (data) => {
        if (data.event_id === parseInt(eventId)) {
          toast.success(`${data.user_name} bergabung ke chat`);
          fetchEventInfo(); // Refresh participants
        }
      });

      socket.on('user_left_event', (data) => {
        if (data.event_id === parseInt(eventId)) {
          toast.info(`${data.user_name} keluar dari chat`);
          fetchEventInfo(); // Refresh participants
        }
      });

      return () => {
        // Leave event chat room when unmounting
        socket.emit('leave_event_chat', parseInt(eventId));
        socket.off('new_event_message');
        socket.off('user_joined_event');
        socket.off('user_left_event');
      };
    }
  }, [socket, isConnected, eventId, user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchEventInfo = async () => {
    try {
      const { data } = await api.get(`/events/${eventId}`);
      setEvent(data.data);
      setParticipants(data.data.participants || []);
    } catch (error) {
      console.error('Error fetching event info:', error);
      toast.error('Gagal memuat info event');
      router.push('/events');
    }
  };

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/chat/event/${eventId}`);
      setMessages(data.data);
      scrollToBottom();
    } catch (error) {
      console.error('Error fetching messages:', error);
      if (error.response?.status === 403) {
        toast.error('Anda bukan peserta event ini');
        router.push(`/events/${eventId}`);
      } else {
        toast.error('Gagal memuat pesan');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!messageText.trim()) return;

    try {
      setSending(true);

      const messageData = {
        content: messageText.trim(),
        message_type: 'text'
      };

      // Send via API
      const { data } = await api.post(`/chat/event/${eventId}`, messageData);

      // Emit via socket for real-time
      if (socket && isConnected) {
        socket.emit('send_event_message', {
          event_id: parseInt(eventId),
          sender_id: user.user_id,
          content: messageText.trim(),
          message_id: data.data.message_id
        });
      }

      // Add message to local state (will be replaced by socket event)
      const newMessage = {
        message_id: data.data.message_id,
        event_id: parseInt(eventId),
        sender_id: user.user_id,
        content: messageText.trim(),
        message_type: 'text',
        sent_at: new Date().toISOString(),
        sender_name: user.name,
        sender_username: user.username,
        sender_picture: user.profile_picture
      };

      setMessages(prev => [...prev, newMessage]);
      setMessageText('');
      scrollToBottom();
      
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Gagal mengirim pesan');
    } finally {
      setSending(false);
    }
  };

  const formatMessageTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('id-ID', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDateSeparator = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Hari Ini';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Kemarin';
    } else {
      return date.toLocaleDateString('id-ID', { 
        weekday: 'long', 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric' 
      });
    }
  };

  const shouldShowDateSeparator = (currentMessage, prevMessage) => {
    if (!prevMessage) return true;
    
    const currentDate = new Date(currentMessage.sent_at).toDateString();
    const prevDate = new Date(prevMessage.sent_at).toDateString();
    
    return currentDate !== prevDate;
  };

  const shouldShowSenderName = (currentMessage, prevMessage) => {
    if (!prevMessage) return true;
    if (currentMessage.sender_id !== prevMessage.sender_id) return true;
    
    // Show name if messages are more than 5 minutes apart
    const timeDiff = new Date(currentMessage.sent_at) - new Date(prevMessage.sent_at);
    return timeDiff > 5 * 60 * 1000; // 5 minutes
  };

  if (loading || !event) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-80px)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading chat...</p>
          </div>
        </div>
      </div>
    );
  }

  const isCreator = user?.user_id === event.created_by;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      {/* Chat Header */}
      <div className="bg-blue-500 text-white px-4 py-4 shadow-lg sticky top-0 z-10">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4 flex-1">
            <button
              onClick={() => router.push(`/events/${eventId}`)}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            
            <div className="flex-1 min-w-0">
              <h2 className="font-bold text-lg truncate">{event.title}</h2>
              <p className="text-sm text-blue-100 flex items-center space-x-2">
                <Users className="w-4 h-4" />
                <span>{participants.length} peserta</span>
                {isCreator && (
                  <span className="bg-yellow-400 text-blue-900 px-2 py-0.5 rounded-full text-xs font-semibold ml-2">
                    Creator
                  </span>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowParticipants(!showParticipants)}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <Users className="w-5 h-5" />
            </button>
            
            <button
              onClick={() => router.push(`/events/${eventId}`)}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <Info className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Connection Status */}
        <div className="max-w-5xl mx-auto mt-2 flex items-center justify-center">
          <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-xs ${
            isConnected ? 'bg-green-500/30' : 'bg-red-500/30'
          }`}>
            <div className={`w-2 h-2 rounded-full ${
              isConnected ? 'bg-green-300 animate-pulse' : 'bg-red-300'
            }`}></div>
            <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto bg-gradient-to-br from-blue-50 to-purple-50">
          <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">
            {/* Welcome Message */}
            {messages.length === 0 && (
              <div className="text-center py-12">
                <div className="bg-white rounded-2xl shadow-lg p-8 mx-auto max-w-md">
                  <Calendar className="w-16 h-16 text-blue-600 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-800 mb-2">
                    Group Chat Event
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {event.title}
                  </p>
                  <p className="text-sm text-gray-500">
                    Mulai chat dengan peserta lainnya!
                  </p>
                </div>
              </div>
            )}

            {messages.map((message, index) => {
              const isMine = message.sender_id === user.user_id;
              const showDateSeparator = shouldShowDateSeparator(message, messages[index - 1]);
              const showSenderName = shouldShowSenderName(message, messages[index - 1]);

              return (
                <div key={message.message_id || index}>
                  {/* Date Separator */}
                  {showDateSeparator && (
                    <div className="flex items-center justify-center my-6">
                      <div className="bg-white px-4 py-2 rounded-full shadow-sm text-sm text-gray-600 font-medium">
                        {formatDateSeparator(message.sent_at)}
                      </div>
                    </div>
                  )}

                  {/* Message Bubble */}
                  <div className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                    <div className={`flex items-end space-x-2 max-w-[70%] ${
                      isMine ? 'flex-row-reverse space-x-reverse' : ''
                    }`}>
                      {/* Avatar (for other users) */}
                      {!isMine && (showSenderName || index === 0 || messages[index - 1]?.sender_id !== message.sender_id) && (
                        <img
                          src={getImageUrl(message.sender_picture)}
                          alt={message.sender_name}
                          className="w-8 h-8 rounded-full object-cover flex-shrink-0 border-2 border-white shadow-md"
                        />
                      )}
                      
                      {/* Spacer for consistent alignment */}
                      {!isMine && !showSenderName && index > 0 && messages[index - 1]?.sender_id === message.sender_id && (
                        <div className="w-8 flex-shrink-0"></div>
                      )}

                      {/* Message Content */}
                      <div>
                        {/* Sender Name */}
                        {!isMine && showSenderName && (
                          <p className="text-xs text-gray-600 mb-1 px-2 font-semibold">
                            {message.sender_name}
                          </p>
                        )}

                        <div className={`px-4 py-3 rounded-2xl shadow-md ${
                          isMine 
                            ? 'bg-blue-500 text-white rounded-br-none' 
                            : 'bg-white text-gray-800 rounded-bl-none'
                        }`}>
                          <p className="break-words whitespace-pre-wrap">{message.content}</p>
                        </div>
                        
                        {/* Timestamp */}
                        <p className={`text-xs text-gray-500 mt-1 px-2 ${isMine ? 'text-right' : 'text-left'}`}>
                          {formatMessageTime(message.sent_at)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Participants Sidebar */}
        {showParticipants && (
          <div className="w-80 bg-white border-l border-gray-200 overflow-y-auto">
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <h3 className="font-bold text-gray-800 flex items-center">
                <Users className="w-5 h-5 mr-2" />
                Peserta ({participants.length})
              </h3>
            </div>
            
            <div className="p-4 space-y-3">
              {participants.map((participant) => (
                <div 
                  key={participant.user_id}
                  className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <img
                    src={getImageUrl(participant.profile_picture)}
                    alt={participant.name}
                    className="w-10 h-10 rounded-full object-cover border-2 border-blue-600"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-800 truncate">
                      {participant.name}
                    </h4>
                    <p className="text-sm text-gray-500 truncate">
                      @{participant.username}
                    </p>
                  </div>
                  {participant.user_id === event.created_by && (
                    <span className="bg-yellow-400 text-yellow-900 text-xs px-2 py-1 rounded-full font-semibold">
                      Creator
                    </span>
                  )}
                  {participant.user_id === user.user_id && (
                    <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full font-semibold">
                      You
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Message Input */}
      <div className="bg-white border-t border-gray-200 px-4 py-4 shadow-lg">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSendMessage} className="flex items-end space-x-3">
            {/* Attachment Button */}
            <button
              type="button"
              className="p-3 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0"
            >
              <Paperclip className="w-5 h-5 text-gray-600" />
            </button>

            {/* Text Input */}
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage(e);
                  }
                }}
                placeholder="Ketik pesan..."
                rows="1"
                className="w-full border-2 border-gray-200 rounded-2xl px-4 py-3 pr-12 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none max-h-32"
                style={{ minHeight: '48px' }}
              />
            </div>

            {/* Send Button */}
            <button
              type="submit"
              disabled={!messageText.trim() || sending}
              className="p-3 bg-blue-500 text-white rounded-full transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0 transform hover:scale-105"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>

          {/* Info Text */}
          <p className="text-xs text-gray-500 mt-2 text-center">
            Press Enter to send • Shift + Enter for new line
          </p>
        </div>
      </div>
    </div>
  );
}

export default function EventChatPage() {
  return (
    <ProtectedRoute>
      <EventChatContent />
    </ProtectedRoute>
  );
}