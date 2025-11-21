"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Nav";
import api from "@/lib/api";
import { getImageUrl, formatCurrency } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";

export default function EventsPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [events, setEvents] = useState([]);
  const [regions, setRegions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [filters, setFilters] = useState({
    region_id: '',
    status: '',
    upcoming: 'true',
    page: 1,
    limit: 9
  });

  useEffect(() => {
    fetchRegions();
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [filters]);

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
      
      const params = new URLSearchParams();
      if (filters.region_id) params.append('region_id', filters.region_id);
      if (filters.status) params.append('status', filters.status);
      if (filters.upcoming) params.append('upcoming', filters.upcoming);
      params.append('page', filters.page);
      params.append('limit', filters.limit);

      const { data } = await api.get(`/events?${params.toString()}`);
      setEvents(data.data);
    } catch (error) {
      console.error('Error fetching events:', error);
      toast.error('Gagal memuat event');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1
    }));
  };

  const handleEventClick = (id) => {
    router.push(`/events/${id}`);
  };

  const handleCreateEvent = () => {
    if (!isAuthenticated) {
      toast.error('Silakan login terlebih dahulu');
      router.push('/login');
      return;
    }
    router.push('/events/create');
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      open: { bg: 'bg-green-100', text: 'text-green-700', label: 'Tersedia' },
      full: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Penuh' },
      ongoing: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Berlangsung' },
      completed: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Selesai' },
      cancelled: { bg: 'bg-red-100', text: 'text-red-700', label: 'Dibatalkan' }
    };
    
    const statusStyle = statusMap[status] || statusMap.open;
    
    return (
      <span className={`${statusStyle.bg} ${statusStyle.text} text-xs font-semibold px-3 py-1 rounded-full`}>
        {statusStyle.label}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-800 mb-2">Event Wisata</h1>
            <p className="text-gray-600">Bergabunglah dengan berbagai kegiatan wisata menarik</p>
          </div>
          
          <button
            onClick={handleCreateEvent}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors duration-200"
          >
            + Buat Event
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Region Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Wilayah
              </label>
              <select
                value={filters.region_id}
                onChange={(e) => handleFilterChange('region_id', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              >
                <option value="">Semua Wilayah</option>
                {regions.map((region) => (
                  <option key={region.region_id} value={region.region_id}>
                    {region.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              >
                <option value="">Semua Status</option>
                <option value="open">Tersedia</option>
                <option value="full">Penuh</option>
                <option value="ongoing">Berlangsung</option>
                <option value="completed">Selesai</option>
              </select>
            </div>

            {/* Time Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Waktu
              </label>
              <select
                value={filters.upcoming}
                onChange={(e) => handleFilterChange('upcoming', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              >
                <option value="true">Event Mendatang</option>
                <option value="">Semua Event</option>
              </select>
            </div>

            {/* Reset Button */}
            <div className="flex items-end">
              <button
                onClick={() => setFilters({ region_id: '', status: '', upcoming: 'true', page: 1, limit: 9 })}
                className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2 rounded-lg transition-colors duration-200"
              >
                Reset Filter
              </button>
            </div>
          </div>
        </div>

        {/* Events List */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-gray-200 rounded-xl h-40 animate-pulse"></div>
            ))}
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">Tidak ada event ditemukan</p>
          </div>
        ) : (
          <div className="space-y-4">
            {events.map((event) => {
              const eventDate = new Date(event.event_date);
              const date = eventDate.getDate();
              const month = eventDate.toLocaleString('id-ID', { month: 'short' }).toUpperCase();

              return (
                <div
                  key={event.event_id}
                  onClick={() => handleEventClick(event.event_id)}
                  className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 p-6 flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-center space-x-6 flex-1">
                    {/* Date Badge */}
                    <div className="bg-blue-600 text-white rounded-lg p-4 text-center min-w-[80px]">
                      <div className="text-3xl font-bold">{date}</div>
                      <div className="text-xs uppercase mt-1">{month}</div>
                    </div>

                    {/* Event Image (if available) */}
                    {event.image && (
                      <div className="w-32 h-24 rounded-lg overflow-hidden flex-shrink-0">
                        <img
                          src={getImageUrl(event.image)}
                          alt={event.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    {/* Event Info */}
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-800 mb-2">{event.title}</h3>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-2">
                        <span className="flex items-center">
                          <span className="mr-1">📍</span> {event.region_name}
                        </span>
                        <span className="flex items-center">
                          <span className="mr-1">🕐</span> {event.event_time}
                        </span>
                        <span className="flex items-center">
                          <span className="mr-1">👥</span> {event.current_participants}/{event.max_participants} peserta
                        </span>
                      </div>
                      {getStatusBadge(event.status)}
                    </div>
                  </div>

                  {/* Action Button */}
                  <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors duration-200 whitespace-nowrap ml-4">
                    Lihat Detail
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {events.length > 0 && (
          <div className="flex justify-center items-center space-x-2 mt-8">
            <button
              onClick={() => handleFilterChange('page', Math.max(1, filters.page - 1))}
              disabled={filters.page === 1}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="px-4 py-2">
              Page {filters.page}
            </span>
            <button
              onClick={() => handleFilterChange('page', filters.page + 1)}
              disabled={events.length < filters.limit}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}
      </main>
    </div>
  );
}