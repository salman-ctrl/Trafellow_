"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { getImageUrl } from '@/lib/utils';
import Navbar from "@/components/layout/Nav";
import toast from 'react-hot-toast';

const RegionList = () => {
  const router = useRouter();
  const [regions, setRegions] = useState([]);
  const [destinations, setDestinations] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [regionsRes, destinationsRes, eventsRes] = await Promise.all([
        api.get('/regions'),
        api.get('/destinations'),
        api.get('/events')
      ]);
      
      setRegions(regionsRes.data.data);
      setDestinations(destinationsRes.data.data?.slice(0, 3) || []);
      setEvents(eventsRes.data.data?.slice(0, 2) || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Gagal memuat data');
    } finally {
      setLoading(false);
    }
  };

  const handleRegionClick = (regionId) => {
    router.push(`/regions/${regionId}`);
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
        <div className="relative h-96 mb-16 bg-gradient-to-r from-purple-500 to-blue-500 animate-pulse"></div>
        <section className="container mx-auto px-4 mb-16">
          <div className="text-center mb-8">
            <div className="h-8 bg-gray-200 rounded w-64 mx-auto mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-96 mx-auto"></div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-gray-200 rounded-xl h-48 animate-pulse"></div>
            ))}
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative h-[60vh] mb-16 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img 
            src="/background/dashboard/hero.png" 
            alt="West Sumatra" 
            className="w-full h-full object-cover opacity-100"
          />
        </div>

        {/* Black Overlay */}
        <div className="absolute inset-0 bg-black/40"></div>

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-white text-center px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Jelajahi Keindahan Sumatera Barat</h1>
          <p className="text-lg md:text-xl mb-6">
            Temukan destinasi wisata menakjubkan dan bergabung dengan komunitas pecinta wisata
          </p>
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-lg transition-colors duration-300">
            Mulai Jelajah
          </button>
        </div>
      </section>

      {/* Region Section - UPDATED */}
      <section className="container mx-auto px-4 mb-16">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Pilih Kabupaten/Kota</h2>
          <p className="text-gray-600">Jelajahi destinasi wisata di berbagai wilayah Sumatera Barat</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {regions.map((region) => (
            <button
              key={region.region_id}
              onClick={() => handleRegionClick(region.region_id)}
              className="group relative rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 h-48"
            >
              {region.image && (
                <img
                  src={getImageUrl(region.image)}
                  alt={region.name}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              )}

              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>

              <div className="relative z-10 flex flex-col items-center justify-center h-full p-4 text-white">
                <h3 className="text-base font-semibold text-center">
                  {region.name}
                </h3>
                <p className="text-sm text-gray-200 mt-1">
                  {region.type === 'kota' ? 'Kota' : 'Kabupaten'}
                </p>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Destinations Section */}
      <section className="container mx-auto px-4 mb-16">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Destinasi Trending</h2>
          <p className="text-gray-600">Tempat wisata paling populer di Sumatera Barat</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {destinations.map((destination) => (
            <div key={destination.destination_id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
              <div className="relative h-48">
                {destination.image && (
                  <img
                    src={getImageUrl(destination.image)}
                    alt={destination.name}
                    className="w-full h-full object-cover"
                  />
                )}
                <div className="absolute top-3 left-3">
                  <span className="bg-blue-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
                    {destination.region?.name || 'Sumatera Barat'}
                  </span>
                </div>
              </div>
              
              <div className="p-5">
                <h3 className="text-xl font-bold text-gray-800 mb-2">{destination.name}</h3>
                <p className="text-gray-600 text-sm mb-3">{destination.region?.name || ''}</p>
                
                <div className="flex items-center mb-4">
                  <span className="text-yellow-500 mr-1">⭐</span>
                  <span className="font-semibold text-gray-800">{destination.rating || '4.5'}</span>
                  <span className="text-gray-500 text-sm ml-1">({destination.reviews_count || '100'} ulasan)</span>
                </div>
                
                <button 
                  onClick={() => handleDestinationClick(destination.destination_id)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition-colors duration-300"
                >
                  Detail
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Events Section */}
      <section className="container mx-auto px-4 mb-16">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Event Mendatang</h2>
          <p className="text-gray-600">Bergabunglah dengan berbagai kegiatan wisata menarik</p>
        </div>

        <div className="space-y-4">
          {events.map((event) => (
            <div key={event.event_id} className="bg-white rounded-xl shadow-lg p-6 flex flex-col md:flex-row gap-6 hover:shadow-xl transition-shadow duration-300">
              <div className="bg-blue-600 text-white rounded-lg p-4 flex flex-col items-center justify-center min-w-[80px]">
                <div className="text-3xl font-bold">{new Date(event.event_date).getDate()}</div>
                <div className="text-sm uppercase">{new Date(event.event_date).toLocaleString('id-ID', { month: 'short' })}</div>
              </div>
              
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-800 mb-2">{event.name}</h3>
                <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-3">
                  <div className="flex items-center gap-1">
                    <span>📍</span>
                    <span>{event.location}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span>👥</span>
                    <span>{event.max_participants || '0'} peserta</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span>💰</span>
                    <span>Rp {event.price?.toLocaleString('id-ID') || '0'}</span>
                  </div>
                </div>
                <span className="inline-block bg-green-100 text-green-800 text-xs font-semibold px-3 py-1 rounded-full">
                  Tersedia
                </span>
              </div>
              
              <div className="flex items-center">
                <button 
                  onClick={() => handleEventClick(event.event_id)}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg transition-colors duration-300 whitespace-nowrap"
                >
                  Lihat Detail
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
};

export default RegionList;