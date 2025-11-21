"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import { Plus, Edit, Trash2, FolderTree } from 'lucide-react';

export default function CategoriesManagement() {
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {}
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      
      // ✅ FIX: Gunakan endpoint yang benar
      const { data } = await api.get('/destination-categories');
      
      console.log('✅ Categories loaded:', data); // Debug log
      
      setCategories(data.data || []);
    } catch (error) {
      console.error('❌ Error fetching categories:', error);
      console.error('❌ Error response:', error.response);
      
      const errorMessage = error.response?.data?.message || 'Gagal memuat data categories';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (categoryId, categoryName) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Category',
      message: `Are you sure you want to delete "${categoryName}"? This will affect all destinations using this category.`,
      onConfirm: async () => {
        try {
          await api.delete(`/destination-categories/${categoryId}`);
          toast.success('Category deleted successfully');
          fetchCategories();
        } catch (error) {
          const errorMessage = error.response?.data?.message || 'Failed to delete category';
          toast.error(errorMessage);
        }
      }
    });
  };

  return (
    <div className="space-y-6 mx-16 my-10">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Category Management</h1>
          <p className="text-gray-600">Manage destination categories</p>
        </div>
        <button
          onClick={() => router.push('/admin/categories/create')}
          className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-600 hover:from-blue-500 hover:to-blue-700 text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-xl flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Add Category</span>
        </button>
      </div>

      {/* Categories Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-gray-200 rounded-2xl h-48 animate-pulse"></div>
          ))}
        </div>
      ) : categories.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl shadow-lg">
          <FolderTree className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">No categories found</p>
          <button
            onClick={() => router.push('/admin/categories/create')}
            className="mt-4 px-6 py-2 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-xl transition-colors"
          >
            Create First Category
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category) => (
            <div
              key={category.category_id}
              className="group bg-white rounded-2xl shadow-lg p-6 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
            >
              {/* Icon */}
              <div className="text-5xl mb-4 text-center">
                {category.icon || '📁'}
              </div>

              {/* Name */}
              <h3 className="text-xl font-bold text-gray-800 text-center mb-2">
                {category.name}
              </h3>

              {/* Slug */}
              <p className="text-sm text-gray-500 text-center mb-4">
                /{category.slug}
              </p>

              {/* Description */}
              {category.description && (
                <p className="text-sm text-gray-600 text-center mb-4 line-clamp-2">
                  {category.description}
                </p>
              )}

              {/* Actions */}
              <div className="flex space-x-2 mt-4">
                <button
                  onClick={() => router.push(`/admin/categories/${category.category_id}/edit`)}
                  className="flex-1 bg-blue-100 text-blue-600 hover:bg-blue-200 py-2 rounded-xl font-semibold transition-colors flex items-center justify-center space-x-2"
                >
                  <Edit className="w-4 h-4" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => handleDelete(category.category_id, category.name)}
                  className="flex-1 bg-red-100 text-red-600 hover:bg-red-200 py-2 rounded-xl font-semibold transition-colors flex items-center justify-center space-x-2"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete</span>
                </button>
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