"use client";

import { useEffect, useRef } from 'react';

export default function MapView({ 
  latitude, 
  longitude, 
  name, 
  zoom = 13,
  height = "h-64" 
}) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const isInitializedRef = useRef(false);

  useEffect(() => {
    // Skip kalau di server-side
    if (typeof window === 'undefined') return;

    // Cek apakah latitude dan longitude valid
    if (!latitude || !longitude) {
      return;
    }

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    if (isNaN(lat) || isNaN(lng)) {
      return;
    }

    // Skip kalau sudah initialized
    if (isInitializedRef.current) return;

    // Import Leaflet secara dynamic (hanya di client-side)
    import('leaflet').then((L) => {
      // Skip kalau map sudah dibuat atau ref tidak ada
      if (mapInstanceRef.current || !mapRef.current) {
        return;
      }

      try {
        // Fix icon issue dengan Leaflet
        delete L.Icon.Default.prototype._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
        });

        // Buat map baru
        const map = L.map(mapRef.current, {
          center: [lat, lng],
          zoom: zoom,
          scrollWheelZoom: true,
          dragging: true,
          zoomControl: true
        });

        // Tambah tile layer (OpenStreetMap)
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19,
        }).addTo(map);

        // Tambah marker
        const marker = L.marker([lat, lng]).addTo(map);
        
        if (name) {
          marker.bindPopup(`<b>${name}</b><br/>Lat: ${lat}<br/>Lng: ${lng}`).openPopup();
        }

        mapInstanceRef.current = map;
        isInitializedRef.current = true;

        // Force map to update size
        setTimeout(() => {
          if (mapInstanceRef.current) {
            mapInstanceRef.current.invalidateSize();
          }
        }, 100);

      } catch (error) {
        console.error('Error initializing map:', error);
      }
    });

    // Cleanup saat unmount
    return () => {
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove();
          mapInstanceRef.current = null;
          isInitializedRef.current = false;
        } catch (error) {
          console.error('Error removing map:', error);
        }
      }
    };
  }, []); // Empty dependency array - only run once!

  // Update map view kalau koordinat berubah (tanpa recreate map)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    if (mapInstanceRef.current && latitude && longitude) {
      const lat = parseFloat(latitude);
      const lng = parseFloat(longitude);
      
      if (!isNaN(lat) && !isNaN(lng)) {
        mapInstanceRef.current.setView([lat, lng], zoom);
      }
    }
  }, [latitude, longitude, zoom]);

  // Kalau tidak ada koordinat, tampilkan placeholder
  if (!latitude || !longitude) {
    return (
      <div className={`${height} bg-gray-200 rounded-lg flex items-center justify-center`}>
        <div className="text-center text-gray-500">
          <svg className="w-16 h-16 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <p>Koordinat tidak tersedia</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <div 
        ref={mapRef} 
        className={`${height} rounded-lg shadow-md`}
        style={{ zIndex: 0 }}
      />
      {/* Loading overlay */}
      {!isInitializedRef.current && (
        <div className={`absolute inset-0 ${height} bg-gray-200 rounded-lg flex items-center justify-center`}>
          <div className="text-center text-gray-500">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p>Loading map...</p>
          </div>
        </div>
      )}
    </div>
  );
}