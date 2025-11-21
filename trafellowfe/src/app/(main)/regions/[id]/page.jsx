"use client";

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import { getImageUrl } from '@/lib/utils';
import Navbar from '@/components/layout/Nav';
import toast from 'react-hot-toast';
import { 
  MapPin, Calendar, Users, Eye, ArrowLeft, 
  Filter, Grid, List 
} from 'lucide-react';

// Dynamic import untuk MapView agar tidak error di SSR
const MapView = dynamic(() => import('@/components/Map/MapView'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-96 bg-gray-200 animate-pulse rounded-lg flex items-center justify-center">
      <p className="text-gray-500">Memuat peta...</p>
    </div>
  )
});

export default function RegionDetail() {
  const params = useParams();
  const router = useRouter();
  const { id } = params;

  const [region, setRegion] = useState(null);
  const [destinations, setDestinations] = useState([]);
  const [events, setEvents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [filters, setFilters] = useState({
    category_id: '',
    view: 'grid'
  });

  useEffect(() => {
    if (id) {
      fetchRegionData();
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchDestinations();
    }
  }, [id, filters.category_id]);

  const fetchRegionData = async () => {
    try {
      setLoading(true);

      const [regionRes, categoriesRes, eventsRes] = await Promise.all([
        api.get(`/regions/${id}`),
        api.get('/destination-categories'),
        api.get(`/events?region_id=${id}`)
      ]);

      setRegion(regionRes.data.data);
      setCategories(categoriesRes.data.data || []);
      setEvents(eventsRes.data.data?.slice(0, 3) || []);
    } catch (error) {
      console.error('Error fetching region:', error);
      toast.error('Gagal memuat data region');
      router.push('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const fetchDestinations = async () => {
    try {
      const params = new URLSearchParams({
        region_id: id
      });

      if (filters.category_id) {
        params.append('category_id', filters.category_id);
      }

      const { data } = await api.get(`/destinations?${params}`);
      setDestinations(data.data || []);
    } catch (error) {
      console.error('Error fetching destinations:', error);
    }
  };

  const handleDestinationClick = (destinationId) => {
    router.push(`/destinations/${destinationId}`);
  };

  const handleEventClick = (eventId) => {
    router.push(`/events/${eventId}`);
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50">
          <div className="h-96 bg-gray-200 animate-pulse"></div>
          <div className="container mx-auto px-4 py-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-gray-200 rounded-xl h-80 animate-pulse"></div>
              ))}
            </div>
          </div>
        </div>
      </>
    );
  }

  if (!region) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Region tidak ditemukan</h2>
            <button
              onClick={() => router.push('/dashboard')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
            >
              Kembali ke Dashboard
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative h-96 mb-8 overflow-hidden">
        {region.image ? (
          <img
            src={getImageUrl(region.image)}
            alt={region.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600"></div>
        )}
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
        
        <div className="absolute inset-0 flex items-end">
          <div className="container mx-auto px-4 pb-8">
            <button
              onClick={() => router.back()}
              className="mb-4 flex items-center space-x-2 text-white hover:text-gray-200 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Kembali</span>
            </button>
            
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className="bg-white/20 backdrop-blur-md text-white px-4 py-2 rounded-full text-sm font-semibold">
                {region.type === 'kota' ? 'Kota' : 'Kabupaten'}
              </span>
              <span className="bg-white/20 backdrop-blur-md text-white px-4 py-2 rounded-full text-sm font-semibold flex items-center space-x-2">
                <MapPin className="w-4 h-4" />
                <span>{destinations.length} Destinasi</span>
              </span>
              <span className="bg-white/20 backdrop-blur-md text-white px-4 py-2 rounded-full text-sm font-semibold flex items-center space-x-2">
                <Calendar className="w-4 h-4" />
                <span>{events.length} Events</span>
              </span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">{region.name}</h1>
            <p className="text-lg md:text-xl text-gray-200 max-w-3xl">{region.description}</p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 pb-16">
        {/* Region Map Section */}
        {region.latitude && region.longitude && (
          <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 mb-8">
            <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-4 flex items-center">
              <MapPin className="w-5 h-5 md:w-6 md:h-6 mr-2 text-blue-600" />
              Lokasi {region.name}
            </h2>
            
            <div className="w-full overflow-hidden rounded-lg">
              <MapView
                latitude={region.latitude}
                longitude={region.longitude}
                name={region.name}
                zoom={12}
                height="h-96"
              />
            </div>

            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-2">
                <span className="font-semibold">Koordinat:</span> {region.latitude}, {region.longitude}
              </p>
              
              <a
                href={`https://www.google.com/maps?q=${region.latitude},${region.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-700 text-sm font-semibold inline-flex items-center gap-1"
              >
                Buka di Google Maps →
              </a>
            </div>
          </div>
        )}

        {/* Filter Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex-1 w-full md:w-auto">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Filter by Category
              </label>
              <select
                value={filters.category_id}
                onChange={(e) => setFilters(prev => ({ ...prev, category_id: e.target.value }))}
                className="w-full md:w-64 border-2 border-gray-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              >
                <option value="">Semua Kategori</option>
                {categories.map((category) => (
                  <option key={category.category_id} value={category.category_id}>
                    {category.icon} {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setFilters(prev => ({ ...prev, view: 'grid' }))}
                className={`p-2 rounded-lg transition-colors ${
                  filters.view === 'grid'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                }`}
                aria-label="Grid view"
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setFilters(prev => ({ ...prev, view: 'list' }))}
                className={`p-2 rounded-lg transition-colors ${
                  filters.view === 'list'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                }`}
                aria-label="List view"
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Destinations Section */}
        <div className="mb-16">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">Destinasi Wisata</h2>
              <p className="text-gray-600">Temukan {destinations.length} destinasi menarik di {region.name}</p>
            </div>
          </div>

          {destinations.length === 0 ? (
            <div className="text-center py-12 bg-gray-100 rounded-xl">
              <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">Belum ada destinasi di region ini</p>
            </div>
          ) : (
            <div className={
              filters.view === 'grid'
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                : 'space-y-4'
            }>
              {destinations.map((destination) => (
                filters.view === 'grid' ? (
                  <div
                    key={destination.destination_id}
                    className="group bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer"
                    onClick={() => handleDestinationClick(destination.destination_id)}
                  >
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={getImageUrl(destination.image)}
                        alt={destination.name}
                        className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                      
                      {destination.category_icon && (
                        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-gray-800 px-3 py-1 rounded-full text-sm font-semibold">
                          {destination.category_icon} {destination.category_name}
                        </div>
                      )}

                      <div className="absolute bottom-3 right-3 flex items-center space-x-1 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full">
                        <Eye className="w-4 h-4 text-gray-600" />
                        <span className="text-sm font-semibold text-gray-800">
                          {destination.view_count || 0}
                        </span>
                      </div>
                    </div>

                    <div className="p-5">
                      <h3 className="text-xl font-bold text-gray-800 mb-2 line-clamp-1">
                        {destination.name}
                      </h3>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {destination.description}
                      </p>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-1 text-gray-500 min-w-0">
                          <MapPin className="w-4 h-4 flex-shrink-0" />
                          <span className="text-sm truncate">{destination.address}</span>
                        </div>
                        {destination.ticket_price > 0 && (
                          <span className="text-blue-600 font-semibold whitespace-nowrap ml-2">
Rp {(Number(destination?.ticket_price) || 0).toLocaleString('id-ID')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div
                    key={destination.destination_id}
                    className="bg-white rounded-xl shadow-lg p-6 flex flex-col md:flex-row gap-6 hover:shadow-xl transition-shadow duration-300 cursor-pointer"
                    onClick={() => handleDestinationClick(destination.destination_id)}
                  >
                    <div className="relative w-full md:w-48 h-48 md:h-32 rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={getImageUrl(destination.image)}
                        alt={destination.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col md:flex-row md:items-start justify-between mb-2 gap-2">
                        <h3 className="text-xl font-bold text-gray-800">{destination.name}</h3>
                        {destination.ticket_price > 0 && (
                          <span className="text-blue-600 font-semibold whitespace-nowrap">
                            Rp {destination.ticket_price.toLocaleString('id-ID')}
                          </span>
                        )}
                      </div>

                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                        {destination.description}
                      </p>

                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                        {destination.category_icon && (
                          <span className="flex items-center space-x-1">
                            <span>{destination.category_icon}</span>
                            <span>{destination.category_name}</span>
                          </span>
                        )}
                        <span className="flex items-center space-x-1">
                          <MapPin className="w-4 h-4 flex-shrink-0" />
                          <span className="truncate">{destination.address}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Eye className="w-4 h-4" />
                          <span>{destination.view_count || 0} views</span>
                        </span>
                      </div>
                    </div>
                  </div>
                )
              ))}
            </div>
          )}
        </div>

        {/* Events Section */}
        {events.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">Event Mendatang</h2>
                <p className="text-gray-600">Bergabunglah dengan kegiatan wisata di {region.name}</p>
              </div>
              <button
                onClick={() => router.push(`/events?region_id=${id}`)}
                className="text-blue-600 hover:text-blue-700 font-semibold hidden md:block"
              >
                Lihat Semua →
              </button>
            </div>

            <div className="space-y-4">
              {events.map((event) => {
                const eventDate = new Date(event.event_date);
                
                return (
                  <div
                    key={event.event_id}
                    className="bg-white rounded-xl shadow-lg p-6 flex flex-col md:flex-row gap-6 hover:shadow-xl transition-shadow duration-300 cursor-pointer"
                    onClick={() => handleEventClick(event.event_id)}
                  >
                    <div className="bg-blue-600 text-white rounded-lg p-4 flex flex-col items-center justify-center min-w-[80px] self-start">
                      <div className="text-3xl font-bold">{eventDate.getDate()}</div>
                      <div className="text-sm uppercase">
                        {eventDate.toLocaleString('id-ID', { month: 'short' })}
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl font-bold text-gray-800 mb-2">{event.title}</h3>
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">{event.description}</p>

                      <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-3">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4 flex-shrink-0" />
                          <span className="truncate">{event.meeting_point}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4 flex-shrink-0" />
                          <span>{event.current_participants}/{event.max_participants} peserta</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4 flex-shrink-0" />
                          <span>{event.event_time}</span>
                        </div>
                      </div>

                      <div>
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                          event.status === 'open'
                            ? 'bg-green-100 text-green-800'
                            : event.status === 'full'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {event.status === 'open' ? 'Tersedia' : event.status === 'full' ? 'Penuh' : 'Ditutup'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center md:items-start">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEventClick(event.event_id);
                        }}
                        className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg transition-colors duration-300 whitespace-nowrap"
                      >
                        Lihat Detail
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              onClick={() => router.push(`/events?region_id=${id}`)}
              className="mt-6 w-full md:hidden bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
            >
              Lihat Semua Event →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}