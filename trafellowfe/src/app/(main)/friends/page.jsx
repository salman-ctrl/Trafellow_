"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Nav";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import api from "@/lib/api";
import { getImageUrl } from "@/lib/utils";
import { Users, UserPlus, UserCheck, UserX, Search, Bell } from "lucide-react";
import toast from "react-hot-toast";

function FriendsContent() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('friends');
  const [friends, setFriends] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    try {
      setLoading(true);

      if (activeTab === 'friends') {
        const { data } = await api.get('/friendships/friends');
        console.log('Friends Response:', data); // Debug
        setFriends(data.data || []);
      } else if (activeTab === 'requests') {
        const { data } = await api.get('/friendships/pending');
        console.log('Pending Requests Response:', data); // Debug
        setPendingRequests(data.data || []);
      } else if (activeTab === 'find') {
        const { data } = await api.get('/users');
        console.log('All Users Response:', data); // Debug
        setAllUsers(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Gagal memuat data');
    } finally {
      setLoading(false);
    }
  };

  const handleSendRequest = async (userId) => {
    try {
      await api.post('/friendships/request', { friend_id: userId });
      toast.success('Permintaan pertemanan terkirim');
      fetchData();
    } catch (error) {
      const message = error.response?.data?.message || 'Gagal mengirim permintaan';
      toast.error(message);
    }
  };

  const handleAcceptRequest = async (friendshipId) => {
    try {
      // PERBAIKAN: Gunakan friendship_id sesuai dengan route backend
      await api.put(`/friendships/${friendshipId}/respond`, { status: 'accepted' });
      toast.success('Permintaan pertemanan diterima');
      fetchData();
    } catch (error) {
      console.error('Accept error:', error);
      toast.error('Gagal menerima permintaan');
    }
  };

  const handleRejectRequest = async (friendshipId) => {
    try {
      // PERBAIKAN: Gunakan friendship_id sesuai dengan route backend
      await api.put(`/friendships/${friendshipId}/respond`, { status: 'rejected' });
      toast.success('Permintaan pertemanan ditolak');
      fetchData();
    } catch (error) {
      console.error('Reject error:', error);
      toast.error('Gagal menolak permintaan');
    }
  };

  const handleDeleteFriend = async (friendshipId) => {
    if (!confirm('Apakah Anda yakin ingin menghapus pertemanan ini?')) {
      return;
    }

    try {
      await api.delete(`/friendships/${friendshipId}`);
      toast.success('Pertemanan dihapus');
      fetchData();
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Gagal menghapus pertemanan');
    }
  };

  const filteredUsers = allUsers.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Teman</h1>
          <p className="text-gray-600">Kelola pertemanan dan temukan teman baru</p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-lg p-2 mb-8 flex space-x-2">
          <button
            onClick={() => setActiveTab('friends')}
            className={`flex-1 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center space-x-2 ${
              activeTab === 'friends'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Users className="w-5 h-5" />
            <span>Teman ({friends.length})</span>
          </button>
          
          <button
            onClick={() => setActiveTab('requests')}
            className={`flex-1 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center space-x-2 relative ${
              activeTab === 'requests'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Bell className="w-5 h-5" />
            <span>Permintaan ({pendingRequests.length})</span>
            {pendingRequests.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-6 h-6 rounded-full flex items-center justify-center">
                {pendingRequests.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('find')}
            className={`flex-1 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center space-x-2 ${
              activeTab === 'find'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <UserPlus className="w-5 h-5" />
            <span>Cari Teman</span>
          </button>
        </div>

        {/* Content */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          {/* Friends List */}
          {activeTab === 'friends' && (
            <div>
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-gray-200 rounded-xl h-20 animate-pulse"></div>
                  ))}
                </div>
              ) : friends.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 text-lg">Belum ada teman</p>
                  <button
                    onClick={() => setActiveTab('find')}
                    className="mt-4 text-blue-600 hover:text-blue-700 font-semibold"
                  >
                    Cari Teman Sekarang
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {friends.map((friend) => (
                    <div
                      key={friend.user_id}
                      className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                    >
                      <img
                        src={getImageUrl(friend.profile_picture)}
                        alt={friend.name}
                        className="w-16 h-16 rounded-full object-cover border-2 border-blue-600"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-800 text-lg">{friend.name}</h3>
                        <p className="text-sm text-gray-500">@{friend.username}</p>
                        {friend.location && (
                          <p className="text-sm text-gray-600 mt-1">📍 {friend.location}</p>
                        )}
                      </div>
                      <div className="flex flex-col space-y-2">
                        <button
                          onClick={() => router.push(`/messages/${friend.user_id}`)}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
                        >
                          Pesan
                        </button>
                        <button
                          onClick={() => handleDeleteFriend(friend.friendship_id)}
                          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
                        >
                          Hapus
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Pending Requests */}
          {activeTab === 'requests' && (
            <div>
              {loading ? (
                <div className="space-y-4">
                  {[1, 2].map((i) => (
                    <div key={i} className="bg-gray-200 rounded-xl h-20 animate-pulse"></div>
                  ))}
                </div>
              ) : pendingRequests.length === 0 ? (
                <div className="text-center py-12">
                  <Bell className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 text-lg">Tidak ada permintaan pertemanan</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingRequests.map((request) => (
                    <div
                      key={request.friendship_id}
                      className="flex items-center space-x-4 p-4 bg-blue-50 border-2 border-blue-200 rounded-xl"
                    >
                      <img
                        src={getImageUrl(request.profile_picture)}
                        alt={request.name}
                        className="w-16 h-16 rounded-full object-cover border-2 border-blue-600"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-800 text-lg">{request.name}</h3>
                        <p className="text-sm text-gray-500">@{request.username}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(request.created_at).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleAcceptRequest(request.friendship_id)}
                          className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors flex items-center space-x-2"
                        >
                          <UserCheck className="w-4 h-4" />
                          <span>Terima</span>
                        </button>
                        <button
                          onClick={() => handleRejectRequest(request.friendship_id)}
                          className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg font-semibold transition-colors flex items-center space-x-2"
                        >
                          <UserX className="w-4 h-4" />
                          <span>Tolak</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Find Friends */}
          {activeTab === 'find' && (
            <div>
              {/* Search Bar */}
              <div className="mb-6">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari nama atau username..."
                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  />
                </div>
              </div>

              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="bg-gray-200 rounded-xl h-20 animate-pulse"></div>
                  ))}
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="text-center py-12">
                  <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 text-lg">Tidak ada user ditemukan</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredUsers.map((user) => (
                    <div
                      key={user.user_id}
                      className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                    >
                      <img
                        src={getImageUrl(user.profile_picture)}
                        alt={user.name}
                        className="w-16 h-16 rounded-full object-cover border-2 border-gray-300"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-800 text-lg">{user.name}</h3>
                        <p className="text-sm text-gray-500">@{user.username}</p>
                        {user.location && (
                          <p className="text-sm text-gray-600 mt-1">📍 {user.location}</p>
                        )}
                      </div>
                      <button
                        onClick={() => handleSendRequest(user.user_id)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors flex items-center space-x-2"
                        disabled={loading}
                      >
                        <UserPlus className="w-4 h-4" />
                        <span>Tambah</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default function FriendsPage() {
  return (
    <ProtectedRoute>
      <FriendsContent />
    </ProtectedRoute>
  );
}