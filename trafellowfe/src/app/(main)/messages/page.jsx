"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Nav";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import api from "@/lib/api";
import { getImageUrl } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { useSocket } from "@/context/SocketContext";
import toast from "react-hot-toast";
import { Search, MessageCircle, Clock, Check, CheckCheck } from "lucide-react";

function MessagesContent() {
  const router = useRouter();
  const { user } = useAuth();
  const { socket, isConnected } = useSocket();
  
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (socket && isConnected) {
      // Listen for new messages to update conversation list
      socket.on('new_dm', (message) => {
        console.log('New DM received in list:', message);
        updateConversationWithNewMessage(message);
      });

      // Listen for message read status
      socket.on('messages_read', (data) => {
        console.log('Messages marked as read:', data);
        updateConversationReadStatus(data.sender_id);
      });

      return () => {
        socket.off('new_dm');
        socket.off('messages_read');
      };
    }
  }, [socket, isConnected]);

  // Group conversations by user_id
  const groupConversationsByUser = (conversationList) => {
    const grouped = new Map();
    
    conversationList.forEach(conv => {
      const userId = conv.user_id;
      
      if (!grouped.has(userId)) {
        // First message from this user
        grouped.set(userId, {
          ...conv,
          unread_count: conv.unread_count || 0
        });
      } else {
        const existing = grouped.get(userId);
        const convTime = new Date(conv.last_message_time);
        const existingTime = new Date(existing.last_message_time);
        
        // Keep the latest message
        if (convTime > existingTime) {
          grouped.set(userId, {
            ...conv,
            // Accumulate unread count from all messages
            unread_count: (existing.unread_count || 0) + (conv.unread_count || 0)
          });
        } else {
          // Keep existing but add unread count
          grouped.set(userId, {
            ...existing,
            unread_count: (existing.unread_count || 0) + (conv.unread_count || 0)
          });
        }
      }
    });
    
    // Convert Map to array and sort by last message time
    return Array.from(grouped.values()).sort((a, b) => 
      new Date(b.last_message_time) - new Date(a.last_message_time)
    );
  };

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/dm/conversations');
      
      const conversationList = data.data || [];
      
      // Group by user and get latest message + total unread count per user
      const groupedConversations = groupConversationsByUser(conversationList);
      
      console.log('Grouped conversations:', groupedConversations);
      setConversations(groupedConversations);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      toast.error('Gagal memuat percakapan');
    } finally {
      setLoading(false);
    }
  };

  // Update conversation when new message arrives
  const updateConversationWithNewMessage = (message) => {
    setConversations(prev => {
      const updatedConvs = [...prev];
      
      // Determine which user this conversation is with
      const otherUserId = message.sender_id === user?.user_id 
        ? message.receiver_id 
        : message.sender_id;
      
      const existingIndex = updatedConvs.findIndex(
        conv => conv.user_id === otherUserId
      );

      if (existingIndex >= 0) {
        // Update existing conversation
        const conv = updatedConvs[existingIndex];
        const isIncoming = message.sender_id !== user?.user_id;
        
        updatedConvs[existingIndex] = {
          ...conv,
          last_message: message.content,
          last_message_time: message.sent_at || new Date().toISOString(),
          sender_id: message.sender_id,
          // Only increment unread if message is from other user AND not currently in chat
          unread_count: isIncoming ? (conv.unread_count || 0) + 1 : conv.unread_count,
          is_read: !isIncoming // If we sent it, it's read by us
        };

        // Move to top
        const updatedConv = updatedConvs.splice(existingIndex, 1)[0];
        return [updatedConv, ...updatedConvs];
      } else {
        // New conversation - refresh the list
        fetchConversations();
        return prev;
      }
    });
  };

  const updateConversationReadStatus = (otherUserId) => {
    setConversations(prev => 
      prev.map(conv => 
        conv.user_id === otherUserId
          ? { ...conv, unread_count: 0, is_read: true }
          : conv
      )
    );
  };

  const handleConversationClick = (userId) => {
    // Optimistically mark as read
    updateConversationReadStatus(userId);
    router.push(`/messages/${userId}`);
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now - date;
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMinutes < 1) return 'Baru saja';
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    if (diffInHours < 24) {
      return date.toLocaleTimeString('id-ID', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    }
    if (diffInDays === 1) return 'Kemarin';
    if (diffInDays < 7) {
      return date.toLocaleDateString('id-ID', { weekday: 'short' });
    }
    return date.toLocaleDateString('id-ID', { 
      day: 'numeric', 
      month: 'short' 
    });
  };

  const filteredConversations = conversations.filter(conv =>
    conv.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.last_message?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get total unread count
  const totalUnreadCount = conversations.reduce((sum, conv) => sum + (conv.unread_count || 0), 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800">Pesan</h1>
            {totalUnreadCount > 0 && (
              <span className="bg-red-500 text-white text-sm font-bold px-3 py-1 rounded-full">
                {totalUnreadCount} Baru
              </span>
            )}
          </div>
          <p className="text-gray-600">
            {conversations.length} Percakapan
          </p>
          
          {/* Connection Status */}
          <div className="mt-3 flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
            <span className="text-xs md:text-sm text-gray-600">
              {isConnected ? 'Terhubung' : 'Terputus'}
            </span>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari percakapan..."
              className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-white"
            />
          </div>
        </div>

        {/* Conversations List */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {loading ? (
            <div className="space-y-2 p-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl animate-pulse">
                  <div className="w-14 h-14 bg-gray-300 rounded-full flex-shrink-0"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="text-center py-16 px-4">
              <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 text-lg mb-2 font-semibold">
                {searchQuery ? 'Tidak ditemukan' : 'Belum ada percakapan'}
              </p>
              <p className="text-gray-500 text-sm">
                {searchQuery 
                  ? 'Coba kata kunci lain' 
                  : 'Mulai chat dengan teman Anda dari halaman Komunitas'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredConversations.map((conversation) => {
                const hasUnread = (conversation.unread_count || 0) > 0;
                const isFromMe = conversation.sender_id === user?.user_id;

                return (
                  <div
                    key={conversation.user_id}
                    onClick={() => handleConversationClick(conversation.user_id)}
                    className={`flex items-center space-x-4 p-4 hover:bg-blue-50 transition-colors cursor-pointer ${
                      hasUnread ? 'bg-blue-50/50' : ''
                    }`}
                  >
                    {/* Profile Picture with Unread Badge */}
                    <div className="relative flex-shrink-0">
                      <img
                        src={getImageUrl(conversation.profile_picture)}
                        alt={conversation.name}
                        className={`w-14 h-14 md:w-16 md:h-16 rounded-full object-cover border-2 ${
                          hasUnread ? 'border-blue-600' : 'border-gray-200'
                        }`}
                      />
                      {/* Unread Badge */}
                      {hasUnread && (
                        <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs min-w-[24px] h-6 px-1.5 rounded-full flex items-center justify-center font-bold shadow-lg">
                          {conversation.unread_count > 99 ? '99+' : conversation.unread_count}
                        </div>
                      )}
                    </div>

                    {/* Message Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className={`text-base md:text-lg truncate ${
                          hasUnread ? 'font-bold text-gray-900' : 'font-semibold text-gray-800'
                        }`}>
                          {conversation.name}
                        </h3>
                        <span className="text-xs text-gray-500 flex items-center space-x-1 ml-2 flex-shrink-0">
                          <Clock className="w-3 h-3" />
                          <span>{formatTime(conversation.last_message_time)}</span>
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {/* Read Status (for messages sent by current user) */}
                        {isFromMe && (
                          <span className="flex-shrink-0">
                            {conversation.is_read ? (
                              <CheckCheck className="w-4 h-4 text-blue-500" />
                            ) : (
                              <Check className="w-4 h-4 text-gray-400" />
                            )}
                          </span>
                        )}
                        
                        {/* Last Message Preview */}
                        <p className={`text-sm truncate flex-1 ${
                          hasUnread && !isFromMe
                            ? 'text-gray-900 font-semibold' 
                            : 'text-gray-600'
                        }`}>
                          {isFromMe && 'Anda: '}
                          {conversation.last_message || 'Foto'}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Empty State Action */}
        {!loading && conversations.length === 0 && !searchQuery && (
          <div className="text-center mt-6">
            <button
              onClick={() => router.push('/friends')}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
            >
              Cari Teman
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

export default function MessagesPage() {
  return (
    <ProtectedRoute>
      <MessagesContent />
    </ProtectedRoute>
  );
}