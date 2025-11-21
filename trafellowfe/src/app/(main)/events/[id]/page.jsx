"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Navbar from "@/components/layout/Nav";
import api from "@/lib/api";
import { getImageUrl, formatCurrency } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";
import { 
  Calendar, Clock, MapPin, Users, DollarSign, 
  User, MessageCircle, CheckCircle,Twitter,MessageCircleIcon ,Facebook, XCircle, 
} from "lucide-react";

export default function EventDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { id } = params;
  const { user, isAuthenticated } = useAuth();
  
  const [event, setEvent] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [isParticipant, setIsParticipant] = useState(false);

  useEffect(() => {
    if (id) {
      fetchEventDetail();
    }
  }, [id]);

  const fetchEventDetail = async () => {
    try {
      const { data } = await api.get(`/events/${id}`);
      setEvent(data.data);
      setParticipants(data.data.participants || []);
      
      // Check if current user is participant
      if (user && data.data.participants) {
        const participant = data.data.participants.find(
          p => p.user_id === user.user_id
        );
        setIsParticipant(!!participant);
      }
    } catch (error) {
      console.error('Error fetching event:', error);
      toast.error('Gagal memuat detail event');
      router.push('/events');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinEvent = async () => {
    if (!isAuthenticated) {
      toast.error('Silakan login terlebih dahulu');
      router.push('/login');
      return;
    }

    try {
      setActionLoading(true);
      await api.post(`/events/${id}/join`);
      toast.success('Berhasil bergabung ke event!');
      fetchEventDetail();
    } catch (error) {
      const message = error.response?.data?.message || 'Gagal bergabung ke event';
      toast.error(message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleLeaveEvent = async () => {
    if (!confirm('Apakah Anda yakin ingin keluar dari event ini?')) {
      return;
    }

    try {
      setActionLoading(true);
      await api.post(`/events/${id}/leave`);
      toast.success('Berhasil keluar dari event');
      fetchEventDetail();
    } catch (error) {
      const message = error.response?.data?.message || 'Gagal keluar dari event';
      toast.error(message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleGoToChat = () => {
    router.push(`/events/${id}/chat`);
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      open: { bg: 'bg-green-500', text: 'Tersedia', icon: CheckCircle },
      full: { bg: 'bg-yellow-500', text: 'Penuh', icon: Users },
      ongoing: { bg: 'bg-blue-500', text: 'Berlangsung', icon: Clock },
      completed: { bg: 'bg-gray-500', text: 'Selesai', icon: CheckCircle },
      cancelled: { bg: 'bg-red-500', text: 'Dibatalkan', icon: XCircle }
    };
    
    const statusInfo = statusMap[status] || statusMap.open;
    const Icon = statusInfo.icon;
    
    return (
      <div className={`${statusInfo.bg} text-white px-4 py-2 rounded-full flex items-center space-x-2 text-sm font-semibold`}>
        <Icon className="w-4 h-4" />
        <span>{statusInfo.text}</span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="bg-gray-200 rounded-2xl h-96 animate-pulse"></div>
        </div>
      </div>
    );
  }

  if (!event) {
    return null;
  }

  const eventDate = new Date(event.event_date);
  const isCreator = user?.user_id === event.created_by;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="relative h-[400px] rounded-3xl overflow-hidden mb-8 shadow-2xl">
          {event.image ? (
            <img
              src={getImageUrl(event.image)}
              alt={event.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600"></div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
          
          {/* Status Badge */}
          <div className="absolute top-6 right-6">
            {getStatusBadge(event.status)}
          </div>

          {/* Title & Basic Info */}
          <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
            <h1 className="text-5xl font-bold mb-4">{event.title}</h1>
            <div className="flex flex-wrap gap-4 text-lg">
              <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-full">
                <MapPin className="w-5 h-5" />
                <span>{event.region_name}</span>
              </div>
              <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-full">
                <Users className="w-5 h-5" />
                <span>{event.current_participants}/{event.max_participants} Peserta</span>
              </div>
              <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-full">
                <User className="w-5 h-5" />
                <span>by {event.creator_name}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                <div className="w-1 h-8 bg-blue-600 mr-3 rounded-full"></div>
                Deskripsi Event
              </h2>
              <p className="text-gray-600 leading-relaxed text-lg">
                {event.description}
              </p>
            </div>

            {/* Event Details */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <div className="w-1 h-8 bg-blue-600 mr-3 rounded-full"></div>
                Detail Event
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-start space-x-4 p-4 bg-blue-50 rounded-xl">
                  <div className="bg-blue-600 p-3 rounded-lg">
                    <Calendar className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Tanggal</p>
                    <p className="font-semibold text-gray-800">
                      {eventDate.toLocaleDateString('id-ID', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4 p-4 bg-green-50 rounded-xl">
                  <div className="bg-green-600 p-3 rounded-lg">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Waktu</p>
                    <p className="font-semibold text-gray-800">{event.event_time}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4 p-4 bg-purple-50 rounded-xl">
                  <div className="bg-purple-600 p-3 rounded-lg">
                    <MapPin className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Meeting Point</p>
                    <p className="font-semibold text-gray-800">{event.meeting_point}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4 p-4 bg-orange-50 rounded-xl">
                  <div className="bg-orange-600 p-3 rounded-lg">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Peserta</p>
                    <p className="font-semibold text-gray-800">
                      {event.current_participants} dari {event.max_participants} orang
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Participants List */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <div className="w-1 h-8 bg-blue-600 mr-3 rounded-full"></div>
                Peserta Event ({participants.length})
              </h2>
              
              {participants.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Belum ada peserta</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {participants.map((participant) => (
                    <div 
                      key={participant.user_id}
                      className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                    >
                      <img
                        src={getImageUrl(participant.profile_picture)}
                        alt={participant.name}
                        className="w-12 h-12 rounded-full object-cover border-2 border-blue-600"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-800">{participant.name}</h3>
                        <p className="text-sm text-gray-500">@{participant.username}</p>
                      </div>
                      {participant.user_id === event.created_by && (
                        <span className="bg-blue-600 text-white text-xs px-3 py-1 rounded-full font-semibold">
                          Creator
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Action Card */}
            {/* Action Card */}
<div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24">
  <div className="space-y-4">
    {isCreator ? (
      <>
        <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 text-center">
          <p className="text-blue-800 font-semibold">Anda adalah creator event ini</p>
        </div>
        
        <button
          onClick={handleGoToChat}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
        >
          <MessageCircle className="w-5 h-5" />
          <span>Buka Group Chat</span>
        </button>

        <button
          onClick={() => router.push(`/events/${id}/edit`)}
          className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-4 rounded-xl transition-colors duration-200"
        >
          Edit Event
        </button>
      </>
    ) : isParticipant ? (
      <>
        <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4 text-center">
          <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
          <p className="text-green-800 font-semibold">Anda sudah terdaftar</p>
        </div>

        <button
          onClick={handleGoToChat}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-4 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
        >
          <MessageCircle className="w-5 h-5" />
          <span>Buka Group Chat</span>
        </button>

        <button
          onClick={handleLeaveEvent}
          disabled={actionLoading}
          className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-4 rounded-xl transition-colors duration-200 disabled:opacity-50"
        >
          {actionLoading ? 'Loading...' : 'Keluar dari Event'}
        </button>
      </>
    ) : (
      <>
        {event.status === 'open' ? (
          <button
            onClick={handleJoinEvent}
            disabled={actionLoading}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-4 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 transform hover:-translate-y-1"
          >
            {actionLoading ? 'Loading...' : 'Gabung Event Sekarang'}
          </button>
        ) : (
          <div className="bg-gray-100 border-2 border-gray-300 rounded-xl p-4 text-center">
            <p className="text-gray-600 font-semibold">Event tidak tersedia</p>
          </div>
        )}
      </>
    )}

    <button
      onClick={() => router.back()}
      className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-4 rounded-xl transition-colors duration-200"
    >
      Kembali
    </button>
  </div>
</div>

            {/* Share Card */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Bagikan Event</h3>
              <div className="space-y-3">
                <button className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-xl transition-colors flex items-center justify-center space-x-2">
                  <span><Facebook /> </span>
                  <span>Facebook</span>
                </button>
                <button className="w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-xl transition-colors flex items-center justify-center space-x-2">
                  <span><MessageCircleIcon /> </span>
                  <span>WhatsApp</span>
                </button>
                <button className="w-full bg-sky-500 hover:bg-sky-600 text-white py-3 rounded-xl transition-colors flex items-center justify-center space-x-2">
                  <span><Twitter /></span>
                  <span>Twitter</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}