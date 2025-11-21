"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import { Eye, XCircle, Trash2, Calendar, Users, MapPin } from 'lucide-react';

export default function EventsAdmin() {
  const router = useRouter();
  const [events, setEvents] = useState([]);
  const [regions, setRegions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination]= useState({ page: 1, limit: 10, total: 0 });
  
  const [filters, setFilters] = useState({
    status: '',
    region_id: ''
  });

  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    type: 'danger'
  });

  useEffect(() => {
    fetchRegions();
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [pagination.page, filters]);

  const fetchRegions = async () => {
    try {
      const { data } = await api.get('/regions');
      setRegions(data.data);
    } catch (error) {
      console.error('Error fetching regions:', error);
    }
  };

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit
      });

      if (filters.status) params.append('status', filters.status);
      if (filters.region_id) params.append('region_id', filters.region_id);

      const { data } = await api.get(`/admin/events?${params}`);
      setEvents(data.data);
      setPagination(prev => ({ ...prev, total: data.pagination.total }));
    } catch (error) {
      console.error('Error fetching events:', error);
      toast.error('Gagal memuat data events');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEvent = (eventId, eventTitle) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Cancel Event',
      message: `Are you sure you want to cancel "${eventTitle}"?`,
      type: 'warning',
      onConfirm: async () => {
        try {
          await api.put(`/admin/events/${eventId}/cancel`);
          toast.success('Event cancelled successfully');
          fetchEvents();
        } catch (error) {
          toast.error('Failed to cancel event');
        }
      }
    });
  };

  const handleDeleteEvent = (eventId, eventTitle) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Event',
      message: `Are you sure you want to delete "${eventTitle}"? This action cannot be undone.`,
      type: 'danger',
      onConfirm: async () => {
        try {
          await api.delete(`/admin/events/${eventId}`);
          toast.success('Event deleted successfully');
          fetchEvents();
        } catch (error) {
          toast.error('Failed to delete event');
        }
      }
    });
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      open: { bg: 'bg-green-100', text: 'text-green-700', label: 'Open' },
      full: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Full' },
      ongoing: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Ongoing' },
      completed: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Completed' },
      cancelled: { bg: 'bg-red-100', text: 'text-red-700', label: 'Cancelled' }
    };
    
    const statusStyle = statusMap[status] || statusMap.open;
    
    return (
      <span className={`${statusStyle.bg} ${statusStyle.text} px-3 py-1 rounded-full text-sm font-semibold`}>
        {statusStyle.label}
      </span>
    );
  };

  return (
    <div className="space-y-6 mx-16 my-12">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Events Monitoring</h1>
          <p className="text-gray-600">Monitor and manage all events</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <select
            value={filters.status}
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
            className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
          >
            <option value="">All Status</option>
            <option value="open">Open</option>
            <option value="full">Full</option>
            <option value="ongoing">Ongoing</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <select
            value={filters.region_id}
            onChange={(e) => setFilters(prev => ({ ...prev, region_id: e.target.value }))}
            className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
          >
            <option value="">All Regions</option>
            {regions.map((region) => (
              <option key={region.region_id} value={region.region_id}>
                {region.name}
              </option>
            ))}
          </select>

          <button
            onClick={() => setFilters({ status: '', region_id: '' })}
            className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-xl transition-colors"
          >
            Reset Filters
          </button>
        </div>
      </div>

      {/* Events Table */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">No events found</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b-2 border-gray-200">
                  <tr>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700">Event</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700">Creator</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700">Region</th>
                    <th className="text-center py-4 px-6 font-semibold text-gray-700">Date & Time</th>
                    <th className="text-center py-4 px-6 font-semibold text-gray-700">Participants</th>
                    <th className="text-center py-4 px-6 font-semibold text-gray-700">Status</th>
                    <th className="text-center py-4 px-6 font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {events.map((event) => {
                    const eventDate = new Date(event.event_date);
                    
                    return (
                      <tr key={event.event_id} className="hover:bg-gray-50 transition-colors">
                        <td className="py-4 px-6">
                          <div>
                            <p className="font-semibold text-gray-800">{event.title}</p>
                            <p className="text-sm text-gray-500 line-clamp-1">{event.description}</p>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-gray-600">{event.creator_name}</td>
                        <td className="py-4 px-6">
                          <span className="inline-flex items-center text-sm text-gray-600">
                            <MapPin className="w-4 h-4 mr-1" />
                            {event.region_name}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-center">
                          <div className="text-sm">
                            <p className="font-semibold text-gray-800">
                              {eventDate.toLocaleDateString('id-ID', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric'
                              })}
                            </p>
                            <p className="text-gray-500">{event.event_time}</p>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-center">
                          <div className="inline-flex items-center bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
                            <Users className="w-4 h-4 mr-1" />
                            <span className="font-semibold">
                              {event.current_participants}/{event.max_participants}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-center">
                          {getStatusBadge(event.status)}
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center justify-center space-x-2">
                            <button
                              onClick={() => router.push(`/admin/events/${event.event_id}`)}
                              className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                              title="View Details"
                            >
                              <Eye className="w-5 h-5" />
                            </button>

                            {event.status === 'open' && (
                              <button
                                onClick={() => handleCancelEvent(event.event_id, event.title)}
                                className="p-2 bg-yellow-100 text-yellow-600 rounded-lg hover:bg-yellow-200 transition-colors"
                                title="Cancel Event"
                              >
                                <XCircle className="w-5 h-5" />
                              </button>
                            )}

                            <button
                              onClick={() => handleDeleteEvent(event.event_id, event.title)}
                              className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                              title="Delete Event"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} events
              </p>
              <div className="flex space-x-2">
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                  disabled={pagination.page === 1}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                <span className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold">
                  {pagination.page}
                </span>
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                  disabled={pagination.page * pagination.limit >= pagination.total}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
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