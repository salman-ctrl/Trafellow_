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
import { Send, ArrowLeft, MoreVertical, Paperclip, Image as ImageIcon, ChevronDown } from "lucide-react";

function ChatWindowContent() {
  const router = useRouter();
  const params = useParams();
  const { userId } = params;
  const { user } = useAuth();
  const { socket, isConnected } = useSocket();
  
  const [messages, setMessages] = useState([]);
  const [otherUser, setOtherUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [showScrollButton, setShowScrollButton] = useState(false);
  
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const messagesContainerRef = useRef(null);

  useEffect(() => {
    if (userId) {
      fetchConversation();
      fetchUserInfo();
    }
  }, [userId]);

  useEffect(() => {
    if (socket && isConnected && userId) {
      // Join DM room
      socket.emit('join_dm', { user_id: user.user_id });

      // Listen for new messages
      socket.on('new_dm', (message) => {
        console.log('New DM received:', message);
        
        // Only add if message is from the conversation we're viewing
        if (message.sender_id === parseInt(userId) || message.receiver_id === parseInt(userId)) {
          setMessages(prev => [...prev, message]);
          scrollToBottom();
          
          // Mark as read if sender is the other user
          if (message.sender_id === parseInt(userId)) {
            markAsRead();
          }
        }
      });

      return () => {
        socket.off('new_dm');
      };
    }
  }, [socket, isConnected, userId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Detect scroll position to show/hide scroll button
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 200;
      setShowScrollButton(!isNearBottom);
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleScrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    setShowScrollButton(false);
  };

  const fetchConversation = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/dm/conversation/${userId}`);
      setMessages(data.data);
      
      // Mark messages as read
      await markAsRead();
    } catch (error) {
      console.error('Error fetching conversation:', error);
      toast.error('Gagal memuat percakapan');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserInfo = async () => {
    try {
      const { data } = await api.get(`/users/${userId}`);
      setOtherUser(data.data);
    } catch (error) {
      console.error('Error fetching user info:', error);
    }
  };

  const markAsRead = async () => {
    try {
      // This will be handled by backend when fetching conversation
      // But you can also add explicit mark as read endpoint if needed
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!messageText.trim()) return;

    try {
      setSending(true);

      const messageData = {
        receiver_id: parseInt(userId),
        content: messageText.trim(),
        message_type: 'text'
      };

      // Send via API
      const { data } = await api.post('/dm/send', messageData);

      // Emit via socket for real-time
      if (socket && isConnected) {
        socket.emit('send_dm', {
          sender_id: user.user_id,
          receiver_id: parseInt(userId),
          content: messageText.trim(),
          message_id: data.data.message_id
        });
      }

      // Add message to local state
      const newMessage = {
        message_id: data.data.message_id,
        sender_id: user.user_id,
        receiver_id: parseInt(userId),
        content: messageText.trim(),
        message_type: 'text',
        sent_at: new Date().toISOString(),
        sender_name: user.name,
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

  if (loading || !otherUser) {
    return (
      <div className="h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <div className="flex items-center justify-center flex-1">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading chat...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <Navbar />

      {/* Chat Header - Fixed */}
      <div className="bg-white border-b border-gray-200 px-4 py-4 shadow-sm flex-shrink-0">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            
            <img
              src={getImageUrl(otherUser.profile_picture)}
              alt={otherUser.name}
              className="w-12 h-12 rounded-full object-cover border-2 border-blue-600"
            />
            
            <div>
              <h2 className="font-bold text-gray-800">{otherUser.name}</h2>
              <p className="text-sm text-gray-500">@{otherUser.username}</p>
            </div>
          </div>

          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <MoreVertical className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Messages Area - Scrollable */}
      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto bg-gradient-to-br from-blue-50 to-purple-50 relative"
      >
        {/* Scroll to Bottom Button */}
        {showScrollButton && (
          <div className="sticky bottom-4 w-full flex justify-center pointer-events-none z-20">
            <button
              onClick={handleScrollToBottom}
              className="pointer-events-auto bg-white hover:bg-gray-50 text-gray-700 p-3 rounded-full shadow-lg hover:shadow-xl transition-all transform hover:scale-110 border border-gray-200"
              aria-label="Scroll to bottom"
            >
              <ChevronDown className="w-6 h-6" />
            </button>
          </div>
        )}

        <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Belum ada pesan. Mulai percakapan!</p>
            </div>
          ) : (
            messages.map((message, index) => {
              const isMine = message.sender_id === user.user_id;
              const showDateSeparator = shouldShowDateSeparator(message, messages[index - 1]);

              return (
                <div key={message.message_id || index}>
                  {showDateSeparator && (
                    <div className="flex items-center justify-center my-6">
                      <div className="bg-white px-4 py-2 rounded-full shadow-sm text-sm text-gray-600 font-medium">
                        {formatDateSeparator(message.sent_at)}
                      </div>
                    </div>
                  )}

                  <div className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                    <div className={`flex items-end space-x-2 max-w-[70%] ${isMine ? 'flex-row-reverse space-x-reverse' : ''}`}>
                      {/* Avatar (for other user) */}
                      {!isMine && (
                        <img
                          src={getImageUrl(message.sender_picture)}
                          alt={message.sender_name}
                          className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                        />
                      )}

                      {/* Message Content */}
                      <div>
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
            })
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Message Input - Fixed */}
      <div className="bg-white border-t border-gray-200 px-4 py-4 shadow-lg flex-shrink-0">
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

          {/* Connection Status */}
          {!isConnected && (
            <div className="mt-2 text-center">
              <span className="text-xs text-red-500">Disconnected - Reconnecting...</span>
            </div>
          )}
        </div>
      </div>
    </div>    
  );
}

export default function ChatWindowPage() {
  return (
    <ProtectedRoute>
      <ChatWindowContent />
    </ProtectedRoute>
  );
}