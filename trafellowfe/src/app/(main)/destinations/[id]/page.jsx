"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useRouter, useParams } from "next/navigation";
import Navbar from "@/components/layout/Nav";
import api from "@/lib/api";
import { getImageUrl } from "@/lib/utils";
import toast from "react-hot-toast";
import { MapPin, Eye, Share2, ArrowLeft, Calendar } from "lucide-react";

// Dynamic import MapView untuk menghindari SSR issues
const MapView = dynamic(() => import('@/components/Map/MapView'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-96 bg-gray-200 animate-pulse rounded-lg flex items-center justify-center">
      <p className="text-gray-500">Memuat peta...</p>
    </div>
  )
});

export default function DestinationDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { id } = params;
  
  const [destination, setDestination] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchDestinationDetail();
    }
  }, [id]);

  const fetchDestinationDetail = async () => {
    try {
      const { data } = await api.get(`/destinations/${id}`);
      setDestination(data.data);
    } catch (error) {
      console.error('Error fetching destination:', error);
      toast.error('Gagal memuat detail destinasi');
      router.push('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleShare = (platform) => {
    const url = window.location.href;
    const text = `Check out ${destination.name} - ${destination.description}`;
    
    if (platform === 'whatsapp') {
      window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`, '_blank');
    } else if (platform === 'facebook') {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="bg-gray-200 rounded-xl h-96 animate-pulse"></div>
        </div>
      </div>
    );
  }

  if (!destination) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Destinasi tidak ditemukan</h2>
            <button
              onClick={() => router.push('/dashboard')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg"
            >
              Kembali ke Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="mb-6 flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Kembali</span>
        </button>

        {/* Hero Image */}
        <div className="relative h-64 md:h-96 rounded-2xl overflow-hidden mb-8 shadow-2xl">
          <img
            src={getImageUrl(destination.image)}
            alt={destination.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
          
          {/* Badges */}
          <div className="absolute top-4 md:top-6 left-4 md:left-6 flex gap-2 flex-wrap max-w-[calc(100%-8rem)]">
            <span className="bg-blue-600 text-white text-xs md:text-sm font-semibold px-3 md:px-4 py-1.5 md:py-2 rounded-full backdrop-blur-sm">
              {destination.region_name}
            </span>
            {destination.category_icon && (
              <span className="bg-green-600 text-white text-xs md:text-sm font-semibold px-3 md:px-4 py-1.5 md:py-2 rounded-full backdrop-blur-sm">
                {destination.category_icon} {destination.category_name}
              </span>
            )}
          </div>

          {/* Views */}
          <div className="absolute top-4 md:top-6 right-4 md:right-6 flex items-center space-x-1 bg-white/90 backdrop-blur-sm px-2.5 md:px-3 py-1.5 md:py-2 rounded-full">
            <Eye className="w-3.5 h-3.5 md:w-4 md:h-4 text-gray-600" />
            <span className="text-xs md:text-sm font-semibold text-gray-800">{destination.view_count || 0}</span>
          </div>

          {/* Title Overlay */}
          <div className="absolute bottom-4 md:bottom-6 left-4 md:left-6 right-4 md:right-6">
            <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold text-white mb-2 md:mb-3 line-clamp-2">
              {destination.name}
            </h1>
            <div className="flex items-center text-white text-sm md:text-lg">
              <MapPin className="w-4 h-4 md:w-5 md:h-5 mr-2 flex-shrink-0" />
              <span className="line-clamp-1">{destination.address}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
              <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-4">Tentang Destinasi</h2>
              <p className="text-gray-600 leading-relaxed text-base md:text-lg">
                {destination.description}
              </p>
            </div>

            {/* Location Map */}
            {destination.latitude && destination.longitude && (
              <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
                <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-4 flex items-center">
                  <MapPin className="w-5 h-5 md:w-6 md:h-6 mr-2 text-blue-600" />
                  Lokasi
                </h2>
                
                {/* Interactive Map with proper container */}
                <div className="w-full overflow-hidden rounded-lg relative">
                  <MapView
                    latitude={destination.latitude}
                    longitude={destination.longitude}
                    name={destination.name}
                    zoom={15}
                    height="h-96"
                  />
                </div>

                {/* Koordinat Info */}
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-2">
                    <span className="font-semibold">Koordinat:</span> {destination.latitude}, {destination.longitude}
                  </p>
                  
                  <a
                    href={`https://www.google.com/maps?q=${destination.latitude},${destination.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-700 text-sm font-semibold inline-flex items-center gap-1 hover:underline"
                  >
                    Buka di Google Maps →
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Info Card */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg md:text-xl font-bold text-gray-800 mb-4">Informasi</h3>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center py-3 border-b border-gray-200 gap-4">
                  <span className="text-gray-600 text-sm md:text-base">Kategori</span>
                  <span className="font-semibold text-gray-800 text-sm md:text-base text-right">
                    {destination.category_icon} {destination.category_name}
                  </span>
                </div>

                <div className="flex justify-between items-center py-3 border-b border-gray-200 gap-4">
                  <span className="text-gray-600 text-sm md:text-base">Wilayah</span>
                  <span className="font-semibold text-gray-800 text-sm md:text-base text-right">
                    {destination.region_name}
                  </span>
                </div>

                <div className="flex justify-between items-center py-3 border-b border-gray-200 gap-4">
                  <span className="text-gray-600 text-sm md:text-base">Harga Tiket</span>
                  <span className="font-semibold text-blue-600 text-sm md:text-base text-right">
                    {destination.ticket_price > 0 
                      ? `Rp ${destination.ticket_price.toLocaleString('id-ID')}` 
                      : 'Gratis'}
                  </span>
                </div>

                <div className="flex justify-between items-center py-3 gap-4">
                  <span className="text-gray-600 text-sm md:text-base">Views</span>
                  <span className="font-semibold text-gray-800 text-sm md:text-base">
                    {destination.view_count}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="bg-white rounded-xl shadow-lg p-6 space-y-3">
              <button
                onClick={() => router.push('/events/create?destination=' + id)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
              >
                <Calendar className="w-5 h-5" />
                <span>Buat Event di Sini</span>
              </button>
              
              <button
                onClick={() => router.back()}
                className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-3 rounded-lg transition-colors duration-200"
              >
                Kembali
              </button>
            </div>

            {/* Share Card */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg md:text-xl font-bold text-gray-800 mb-4 flex items-center">
                <Share2 className="w-5 h-5 mr-2" />
                Bagikan
              </h3>
              <div className="flex gap-3">
                <button 
                  onClick={() => handleShare('facebook')}
                  className="flex-1 bg-blue-500 text-white py-2.5 rounded-lg hover:bg-blue-600 transition-colors font-semibold text-sm md:text-base"
                >
                  Facebook
                </button>
                <button 
                  onClick={() => handleShare('whatsapp')}
                  className="flex-1 bg-green-500 text-white py-2.5 rounded-lg hover:bg-green-600 transition-colors font-semibold text-sm md:text-base"
                >
                  WhatsApp
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}