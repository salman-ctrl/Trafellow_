"use client";

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import api from '@/lib/api';
import { getImageUrl } from '@/lib/utils';
import toast from 'react-hot-toast';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import { 
  ArrowLeft, Calendar, Clock, MapPin, Users, 
  User, XCircle, Trash2, MessageCircle 
} from 'lucide-react';

export default function EventAdminDetail() {
  const router = useRouter();
  const params = useParams();
  const { id } = params;
  
  const [event, setEvent] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    type: 'danger'
  });

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
    } catch (error) {
      console.error('Error fetching event:', error);
      toast.error('Gagal memuat detail event');
      router.push('/admin/events');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEvent = () => {
    setConfirmDialog({
      isOpen: true,
      title: 'Cancel Event',
      message: `Are you sure you want to cancel "${event.title}"?`,
      type: 'warning',
      onConfirm: async () => {
        try {
          await api.put(`/admin/events/${id}/cancel`);
          toast.success('Event cancelled successfully');
          fetchEventDetail();
        } catch (error) {
          toast.error('Failed to cancel event');
        }
      }
    });
  };

  const handleDeleteEvent = () => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Event',
      message: `Are you sure you want to delete "${event.title}"? This action cannot be undone.`,
      type: 'danger',
      onConfirm: async () => {
        try {
          await api.delete(`/admin/events/${id}`);
          toast.success('Event deleted successfully');
          router.push('/admin/events');
        } catch (error) {
          toast.error('Failed to delete event');
        }
      }
    });
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      open: { bg: 'bg-green-500', text: 'Open' },
      full: { bg: 'bg-yellow-500', text: 'Full' },
      ongoing: { bg: 'bg-blue-500', text: 'Ongoing' },
      completed: { bg: 'bg-gray-500', text: 'Completed' },
      cancelled: { bg: 'bg-red-500', text: 'Cancelled' }
    };
    
    const statusInfo = statusMap[status] || statusMap.open;
    
    return (
      <span className={`${statusInfo.bg} text-white px-4 py-2 rounded-full font-semibold`}>
        {statusInfo.text}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!event) return null;

  const eventDate = new Date(event.event_date);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          <div>
            <h1 className="text-4xl font-bold text-gray-800">Event Details</h1>
            <p className="text-gray-600">Admin view and management</p>
          </div>
        </div>

        <div className="flex space-x-3">
          {event.status === 'open' && (
            <button
              onClick={handleCancelEvent}
              className="px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold rounded-xl transition-colors flex items-center space-x-2"
            >
              <XCircle className="w-5 h-5" />
              <span>Cancel Event</span>
            </button>
          )}
          
          <button
            onClick={handleDeleteEvent}
            className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-xl transition-colors flex items-center space-x-2"
          >
            <Trash2 className="w-5 h-5" />
            <span>Delete Event</span>
          </button>
        </div>
      </div>

      {/* Event Hero */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="relative h-96">
          {event.image ? (
            <img
              src={getImageUrl(event.image)}
              alt={event.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600"></div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
          
          {/* Status Badge */}
          <div className="absolute top-6 right-6">
            {getStatusBadge(event.status)}
          </div>

          {/* Title & Basic Info */}
          <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
            <h2 className="text-4xl font-bold mb-4">{event.title}</h2>
            <div className="flex flex-wrap gap-4 text-lg">
              <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-full">
                <MapPin className="w-5 h-5" />
                <span>{event.region_name}</span>
              </div>
              <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-full">
                <Users className="w-5 h-5" />
                <span>{event.current_participants}/{event.max_participants} Participants</span>
              </div>
              <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-full">
                <User className="w-5 h-5" />
                <span>by {event.creator_name}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Event Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Description</h3>
            <p className="text-gray-600 leading-relaxed">{event.description}</p>
          </div>

          {/* Event Info */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">Event Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-start space-x-4 p-4 bg-blue-50 rounded-xl">
                <div className="bg-blue-600 p-3 rounded-lg">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Date</p>
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
                  <p className="text-sm text-gray-600 mb-1">Time</p>
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
                  <p className="text-sm text-gray-600 mb-1">Participants</p>
                  <p className="font-semibold text-gray-800">
                    {event.current_participants} / {event.max_participants}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Participants List */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">
              Participants ({participants.length})
            </h3>
            
            {participants.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No participants yet</p>
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
                      className="w-12 h-12 rounded-full object-cover border-2 border-indigo-600"
                    />
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-800">{participant.name}</h4>
                      <p className="text-sm text-gray-500">@{participant.username}</p>
                    </div>
                    {participant.user_id === event.created_by && (
                      <span className="bg-indigo-600 text-white text-xs px-3 py-1 rounded-full font-semibold">
                        Creator
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar - Quick Actions */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Quick Actions</h3>
            
            <div className="space-y-3">
              <button
                onClick={() => router.push(`/events/${id}`)}
                className="w-full bg-blue-100 text-blue-600 hover:bg-blue-200 py-3 rounded-xl font-semibold transition-colors flex items-center justify-center space-x-2"
              >
                <Eye className="w-5 h-5" />
                <span>View as User</span>
              </button>

              <button
                onClick={() => router.push(`/events/${id}/chat`)}
                className="w-full bg-purple-100 text-purple-600 hover:bg-purple-200 py-3 rounded-xl font-semibold transition-colors flex items-center justify-center space-x-2"
              >
                <MessageCircle className="w-5 h-5" />
                <span>View Chat</span>
              </button>

              {event.status === 'open' && (
                <button
                  onClick={handleCancelEvent}
                  className="w-full bg-yellow-500 hover:bg-yellow-600 text-white py-3 rounded-xl font-semibold transition-colors flex items-center justify-center space-x-2"
                >
                  <XCircle className="w-5 h-5" />
                  <span>Cancel Event</span>
                </button>
              )}

              <button
                onClick={handleDeleteEvent}
                className="w-full bg-red-500 hover:bg-red-600 text-white py-3 rounded-xl font-semibold transition-colors flex items-center justify-center space-x-2"
              >
                <Trash2 className="w-5 h-5" />
                <span>Delete Event</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        message={confirmDialog.message}
        type={confirmDialog.type}
      />
    </div>
  );
}