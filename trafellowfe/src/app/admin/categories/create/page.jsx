"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { ArrowLeft, FolderTree } from 'lucide-react';

export default function CreateCategory() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    icon: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Auto-generate slug from name
    if (name === 'name') {
      const slug = value.toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
      
      setFormData(prev => ({
        ...prev,
        name: value,
        slug: slug
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name) {
      toast.error('Nama kategori wajib diisi');
      return;
    }

    try {
      setLoading(true);

      await api.post('/destination-categories', formData);

      toast.success('Category berhasil dibuat!');
      router.push('/admin/categories');
    } catch (error) {
      const message = error.response?.data?.message || 'Gagal membuat category';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  // Emoji suggestions
  const emojiSuggestions = [
    { emoji: '🏞️', label: 'Alam' },
    { emoji: '🎭', label: 'Budaya' },
    { emoji: '🏛️', label: 'Sejarah' },
    { emoji: '🍽️', label: 'Kuliner' },
    { emoji: '🏖️', label: 'Pantai' },
    { emoji: '⛰️', label: 'Gunung' },
    { emoji: '🏰', label: 'Bangunan' },
    { emoji: '🎨', label: 'Seni' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-gray-600" />
        </button>
        <div>
          <h1 className="text-4xl font-bold text-gray-800">Create New Category</h1>
          <p className="text-gray-600">Add a new destination category</p>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Category Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g., Wisata Alam"
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
              required
            />
          </div>

          {/* Slug (Auto-generated) */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Slug (Auto-generated)
            </label>
            <input
              type="text"
              name="slug"
              value={formData.slug}
              onChange={handleChange}
              placeholder="wisata-alam"
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 bg-gray-50 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
            />
            <p className="text-xs text-gray-500 mt-1">URL-friendly version of the name</p>
          </div>

          {/* Icon */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Icon (Emoji)
            </label>
            <input
              type="text"
              name="icon"
              value={formData.icon}
              onChange={handleChange}
              placeholder="🏞️"
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all text-3xl text-center"
            />
            
            {/* Emoji Suggestions */}
            <div className="mt-4">
              <p className="text-sm text-gray-600 mb-2">Quick select:</p>
              <div className="flex flex-wrap gap-2">
                {emojiSuggestions.map((item, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, icon: item.emoji }))}
                    className="p-3 bg-gray-100 hover:bg-orange-100 rounded-xl transition-colors text-2xl"
                    title={item.label}
                  >
                    {item.emoji}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Description (Optional)
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
              placeholder="Describe this category..."
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all resize-none"
            />
          </div>

          {/* Preview */}
          <div className="bg-orange-50 rounded-xl p-6 border-2 border-orange-200">
            <p className="text-sm font-semibold text-gray-700 mb-3">Preview:</p>
            <div className="bg-white rounded-xl p-6 text-center">
              <div className="text-5xl mb-3">{formData.icon || '📁'}</div>
              <h3 className="text-xl font-bold text-gray-800 mb-1">
                {formData.name || 'Category Name'}
              </h3>
              <p className="text-sm text-gray-500">/{formData.slug || 'category-slug'}</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-4 pt-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-3 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-500 text-white font-semibold py-3 rounded-xl transition-all disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Category'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}