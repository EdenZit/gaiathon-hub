'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { PhotoIcon, XMarkIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { IGalleryImage } from '@/models/Gallery';

type Category = 'teams' | 'workshops' | 'visits' | 'social';
const CATEGORIES: Category[] = ['teams', 'workshops', 'visits', 'social'];

interface GalleryItem {
  _id: string;
  title: string;
  description: string;
  category: Category;
  images: IGalleryImage[];
  createdAt: string;
}

export default function GalleryManagementPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [images, setImages] = useState<IGalleryImage[]>([]);
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: CATEGORIES[0] as Category
  });

  useEffect(() => {
    fetchGalleryItems();
  }, []);

  const fetchGalleryItems = async () => {
    try {
      const res = await fetch('/api/gallery');
      if (!res.ok) throw new Error('Failed to fetch gallery items');
      const data = await res.json();
      setGalleryItems(data.items);
    } catch (err) {
      console.error('Error fetching gallery items:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this gallery item?')) return;

    try {
      const res = await fetch(`/api/gallery/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Failed to delete gallery item');
      
      // Remove item from state
      setGalleryItems(items => items.filter(item => item._id !== id));
    } catch (err) {
      console.error('Error deleting gallery item:', err);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;

    // Convert selected files to gallery images
    const newImages: IGalleryImage[] = [];
    const selectedCategory = formData.category || 'teams';
    
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Create form data for file upload
        const formData = new FormData();
        formData.append('file', file);
        formData.append('category', selectedCategory);

        // Upload the file
        const uploadRes = await fetch('/api/gallery/upload', {
          method: 'POST',
          body: formData
        });

        if (!uploadRes.ok) {
          const errorData = await uploadRes.json();
          throw new Error(errorData.error || 'Failed to upload image');
        }

        const uploadData = await uploadRes.json();
        
        // Add to images array with the returned URL
        newImages.push({
          url: uploadData.url,
          caption: file.name.split('.')[0] // Use filename as initial caption
        });
      }

      setImages([...images, ...newImages]);
    } catch (err) {
      console.error('Error uploading images:', err);
      setError(err instanceof Error ? err.message : 'Failed to upload images. Please try again.');
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const updateCaption = (index: number, caption: string) => {
    const newImages = [...images];
    newImages[index].caption = caption;
    setImages(newImages);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (images.length === 0) {
      setError('Please add at least one image');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/gallery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          images
        })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to create gallery item');
      }

      // Reset form
      setFormData({
        title: '',
        description: '',
        category: CATEGORIES[0] as Category
      });
      setImages([]);
      
      // Refresh the page
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Gallery Management</h1>
      </div>

      {/* Gallery Items List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="divide-y divide-gray-200">
          {galleryItems.map((item) => (
            <div key={item._id} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900">{item.title}</h3>
                  <p className="mt-1 text-sm text-gray-500">{item.description}</p>
                  <div className="mt-2 flex items-center space-x-4 text-sm">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {item.category}
                    </span>
                    <span className="text-gray-500">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="ml-4 flex-shrink-0 flex space-x-2">
                  <button
                    type="button"
                    onClick={() => handleDelete(item._id)}
                    className="inline-flex items-center p-1 border border-transparent rounded-full text-red-600 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {item.images.map((image, index) => (
                  <div key={index} className="relative aspect-video">
                    <Image
                      src={image.url}
                      alt={image.caption}
                      fill
                      className="object-cover rounded-lg"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 hover:opacity-100 transition-opacity duration-200 rounded-lg flex items-center justify-center">
                      <p className="text-white text-sm text-center px-2">{image.caption}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
          {galleryItems.length === 0 && (
            <div className="p-6 text-center text-gray-500">
              No gallery items found
            </div>
          )}
        </div>
      </div>

      {/* Add New Gallery Item Form */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Add New Gallery Item</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
              Title
            </label>
            <input
              type="text"
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              required
              minLength={3}
              maxLength={100}
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              required
              rows={3}
              minLength={3}
              maxLength={500}
            />
          </div>

          {/* Category */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700">
              Category
            </label>
            <select
              id="category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value as Category })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Images
            </label>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {/* Existing Images */}
              {images.map((image, index) => (
                <div key={index} className="relative">
                  <div className="aspect-video relative">
                    <Image
                      src={image.url}
                      alt={image.caption}
                      fill
                      className="object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </button>
                  </div>
                  <input
                    type="text"
                    value={image.caption}
                    onChange={(e) => updateCaption(index, e.target.value)}
                    className="mt-1 block w-full text-sm rounded-md border border-gray-300 px-2 py-1 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="Image caption"
                    required
                  />
                </div>
              ))}

              {/* Upload Button */}
              <label className="aspect-video flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500">
                <div className="text-center">
                  <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <span className="mt-2 block text-sm font-medium text-gray-600">
                    Add Images
                  </span>
                </div>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                />
              </label>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="text-red-500 text-sm">{error}</div>
          )}

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full rounded-md bg-blue-600 px-4 py-2 text-white font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isSubmitting ? 'Adding...' : 'Add Gallery Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 