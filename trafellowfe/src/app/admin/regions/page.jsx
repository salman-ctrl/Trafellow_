"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { getImageUrl } from '@/lib/utils';
import toast from 'react-hot-toast';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import { Plus, Edit, Trash2, MapPin } from 'lucide-react';

export default function RegionsManagement() {
  const router = useRouter();
  const [regions, setRegions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {}
  });

  useEffect(() => {
    fetchRegions();
  }, []);

  const fetchRegions = async () => {
    try {
      const { data } = await api.get('/regions');
      setRegions(data.data);
    } catch (error) {
      console.error('Error fetching regions:', error);
      toast.error('Gagal memuat data regions');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (regionId, regionName) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Region',
      message: `Are you sure you want to delete "${regionName}"? This will also delete all destinations in this region.`,
      onConfirm: async () => {
        try {
          await api.delete(`/regions/${regionId}`);
          toast.success('Region deleted successfully');
          fetchRegions();
        } catch (error) {
          toast.error('Failed to delete region');
        }
      }
    });
  };

  return (
    <div className="space-y-6 mx-16 my-10">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Region Management</h1>
          <p className="text-gray-600">Manage regions in Sumatera Barat</p>
        </div>
        <button
          onClick={() => router.push('/admin/regions/create')}
          className="px-6 py-3 bg-blue-500 hover:from-green-700 hover:to-emerald-700 text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-xl flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Add Region</span>
        </button>
      </div>

      {/* Regions Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-gray-200 rounded-2xl h-64 animate-pulse"></div>
          ))}
        </div>
      ) : regions.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl shadow-lg">
          <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">No regions found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {regions.map((region) => (
            <div
              key={region.region_id}
              className="group bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
            >
              {/* Image */}
              <div className="relative h-48 overflow-hidden">
                {region.image ? (
                  <img
                    src={getImageUrl(region.image)}
                    alt={region.name}
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full bg-blue-500"></div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                
                {/* Type Badge */}
                <div className="absolute top-4 right-4">
                  <span className="bg-white text-blue-500 px-3 py-1 rounded-full text-sm font-semibold capitalize">
                    {region.type}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="text-2xl font-bold text-gray-800 mb-2">{region.name}</h3>
                <p className="text-gray-600 mb-4 line-clamp-2">{region.description}</p>

                {region.latitude && region.longitude && (
                  <div className="flex items-center space-x-2 text-sm text-gray-500 mb-4">
                    <MapPin className="w-4 h-4" />
                    <span>{region.latitude}, {region.longitude}</span>
                  </div>
                )}

                {/* Actions */}
                <div className="flex space-x-2">
                  <button
                    onClick={() => router.push(`/admin/regions/${region.region_id}/edit`)}
                    className="flex-1 bg-blue-100 text-blue-600 hover:bg-blue-200 py-2 rounded-xl font-semibold transition-colors flex items-center justify-center space-x-2"
                  >
                    <Edit className="w-4 h-4" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => handleDelete(region.region_id, region.name)}
                    className="flex-1 bg-red-100 text-red-600 hover:bg-red-200 py-2 rounded-xl font-semibold transition-colors flex items-center justify-center space-x-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        message={confirmDialog.message}
        type="danger"
      />
    </div>
  );
}