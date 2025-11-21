"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { getImageUrl } from '@/lib/utils';
import toast from 'react-hot-toast';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import { Plus, Edit, Trash2, Search, Filter, Eye, MapPinned } from 'lucide-react';

export default function DestinationsAdmin() {
  const router = useRouter();
  const [destinations, setDestinations] = useState([]);
  const [regions, setRegions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 9, total: 0 });
  
  const [filters, setFilters] = useState({
    search: '',
    region_id: '',
    category_id: ''
  });

  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {}
  });

  useEffect(() => {
    fetchRegionsAndCategories();
  }, []);

  useEffect(() => {
    fetchDestinations();
  }, [pagination.page, filters]);

  const fetchRegionsAndCategories = async () => {
    try {
      const [regionsRes, categoriesRes] = await Promise.all([
        api.get('/regions'),
        api.get('/destination-categories')
      ]);
      setRegions(regionsRes.data.data);
      setCategories(categoriesRes.data.data);
    } catch (error) {
      console.error('Error fetching filters:', error);
    }
  };

  const fetchDestinations = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit
      });

      if (filters.region_id) params.append('region_id', filters.region_id);
      if (filters.category_id) params.append('category_id', filters.category_id);

      const { data } = await api.get(`/destinations?${params}`);
      setDestinations(data.data);
      setPagination(prev => ({ ...prev, total: data.pagination?.total || 0 }));
    } catch (error) {
      console.error('Error fetching destinations:', error);
      toast.error('Gagal memuat data destinations');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleDelete = (destinationId, destinationName) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Destination',
      message: `Are you sure you want to delete "${destinationName}"?`,
      onConfirm: async () => {
        try {
          await api.delete(`/destinations/${destinationId}`);
          toast.success('Destination deleted successfully');
          fetchDestinations();
        } catch (error) {
          toast.error('Failed to delete destination');
        }
      }
    });
  };

  return (
    <div className="space-y-6 mx-16 my-12">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Destinations Management</h1>
          <p className="text-gray-600">Manage all destinations in Sumatera Barat</p>
        </div>
        <button
          onClick={() => router.push('/admin/destinations/create')}
          className="px-6 py-3 bg-blue-500 text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-xl flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Add Destination</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <select
            value={filters.region_id}
            onChange={(e) => handleFilterChange('region_id', e.target.value)}
            className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
          >
            <option value="">All Regions</option>
            {regions.map((region) => (
              <option key={region.region_id} value={region.region_id}>
                {region.name}
              </option>
            ))}
          </select>

          <select
            value={filters.category_id}
            onChange={(e) => handleFilterChange('category_id', e.target.value)}
            className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
          >
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option key={category.category_id} value={category.category_id}>
                {category.icon} {category.name}
              </option>
            ))}
          </select>

          <button
            onClick={() => setFilters({ search: '', region_id: '', category_id: '' })}
            className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-xl transition-colors flex items-center justify-center space-x-2"
          >
            <span>Reset Filters</span>
          </button>
        </div>
      </div>

      {/* Destinations Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-gray-200 rounded-2xl h-96 animate-pulse"></div>
          ))}
        </div>
      ) : destinations.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl shadow-lg">
          <MapPinned className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">No destinations found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {destinations.map((destination) => (
            <div
              key={destination.destination_id}
              className="group bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
            >
              {/* Image */}
              <div className="relative h-48 overflow-hidden">
                <img
                  src={getImageUrl(destination.image)}
                  alt={destination.name}
                  className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                
                {/* Badges */}
                <div className="absolute top-4 left-4">
                  <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                    {destination.region_name}
                  </span>
                </div>
                <div className="absolute top-4 right-4">
                  <span className="bg-green-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                    {destination.category_name}
                  </span>
                </div>

                {/* View Count */}
                <div className="absolute bottom-4 right-4 bg-black/50 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm flex items-center space-x-1">
                  <Eye className="w-4 h-4" />
                  <span>{destination.view_count || 0}</span>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-2 line-clamp-1">
                  {destination.name}
                </h3>
                <p className="text-gray-600 mb-4 line-clamp-2 text-sm">
                  {destination.description}
                </p>

                {/* Actions */}
                <div className="flex space-x-2">
                  <button
                    onClick={() => router.push(`/destinations/${destination.destination_id}`)}
                    className="flex-1 bg-gray-100 text-gray-600 hover:bg-gray-200 py-2 rounded-xl font-semibold transition-colors flex items-center justify-center  space-x-2"
                  >
                    <Eye className="w-4 h-4" />
                    <span>View</span>
                  </button>
                  <button
                    onClick={() => router.push(`/admin/destinations/${destination.destination_id}/edit`)}
                    className="flex-1 bg-blue-100 text-blue-600 hover:bg-blue-200 py-2 rounded-xl font-semibold transition-colors flex items-center justify-center space-x-2"
                  >
                    <Edit className="w-4 h-4" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => handleDelete(destination.destination_id, destination.name)}
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

      {/* Pagination */}
      {destinations.length > 0 && (
        <div className="flex items-center justify-between bg-white rounded-2xl shadow-lg px-6 py-4">
          <p className="text-sm text-gray-600">
            Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} destinations
          </p>
          <div className="flex space-x-4">
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
              disabled={pagination.page === 1}
              className="px-4 mr-2 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            <span className="px-4 py-2 bg-purple-600 text-white rounded-lg font-semibold">
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