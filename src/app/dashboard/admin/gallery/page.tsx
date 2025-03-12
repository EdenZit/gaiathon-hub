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

    // Check file size limit (5MB)
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes
    
    // Convert selected files to gallery images
    const newImages: IGalleryImage[] = [];
    const selectedCategory = formData.category || 'teams';
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Check file size
        if (file.size > MAX_FILE_SIZE) {
          console.warn(`File "${file.name}" exceeds the 5MB size limit`);
          setError(`File "${file.name}" exceeds the 5MB size limit`);
          continue;
        }
        
        // Create form data for file upload
        const formData = new FormData();
        formData.append('file', file);
        formData.append('category', selectedCategory);

        console.log(`Uploading file: ${file.name}, size: ${file.size}, type: ${file.type}`);

        // Upload the file
        const uploadRes = await fetch('/api/gallery/upload', {
          method: 'POST',
          body: formData
        });

        if (!uploadRes.ok) {
          const errorData = await uploadRes.json();
          console.error('Upload error response:', errorData);
          throw new Error(errorData.error || 'Failed to upload image');
        }

        const uploadData = await uploadRes.json();
        console.log('Upload success:', uploadData);
        
        // Add to images array with the returned URL
        newImages.push({
          url: uploadData.url,
          caption: file.name.split('.')[0] // Use filename as initial caption
        });
      }

      if (newImages.length > 0) {
        setImages([...images, ...newImages]);
        setError(null); // Clear any previous errors if at least one upload succeeded
      }
    } catch (err) {
      console.error('Error uploading images:', err);
      setError(err instanceof Error ? err.message : 'Failed to upload images. Please try again.');
    } finally {
      setIsSubmitting(false);
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
      console.log('Submitting gallery item:', { ...formData, images });
      
      const res = await fetch('/api/gallery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          images
        })
      });

      if (!res.ok) {
        const errorData = await res.json();
        console.error('Gallery submission error:', errorData);
        throw new Error(errorData.error || 'Failed to create gallery item');
      }

      // Reset form
      setFormData({
        title: '',
        description: '',
        category: CATEGORIES[0]
      });
      setImages([]);
      
      // Refresh gallery items
      await fetchGalleryItems();
      
      // Show success message
      alert('Gallery item created successfully!');
    } catch (err) {
      console.error('Error creating gallery item:', err);
      setError(err instanceof Error ? err.message : 'Failed to create gallery item');
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
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Images
            </label>
            <div className="flex items-center justify-center w-full">
              <label
                className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer ${
                  isSubmitting ? 'bg-gray-100 border-gray-300' : 'bg-gray-50 border-gray-300 hover:bg-gray-100'
                }`}
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  {isSubmitting ? (
                    <>
                      <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-2"></div>
                      <p className="text-sm text-gray-500">Uploading...</p>
                    </>
                  ) : (
                    <>
                      <PhotoIcon className="w-10 h-10 text-gray-400 mb-2" />
                      <p className="text-sm text-gray-500">
                        <span className="font-semibold">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF up to 5MB</p>
                    </>
                  )}
                </div>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  disabled={isSubmitting}
                />
              </label>
            </div>
            
            {/* Error Message */}
            {error && (
              <p className="text-sm text-red-500 mt-2">{error}</p>
            )}
            
            {/* Image Preview */}
            {images.length > 0 && (
              <div className="mt-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Selected Images</h3>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                  {images.map((image, index) => (
                    <div key={index} className="relative group">
                      <div className="aspect-video relative rounded-lg overflow-hidden border border-gray-200">
                        <Image
                          src={image.url}
                          alt={image.caption}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black bg-opacity-50 rounded-lg">
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="p-1 bg-red-600 text-white rounded-full"
                        >
                          <XMarkIcon className="h-5 w-5" />
                        </button>
                      </div>
                      <input
                        type="text"
                        value={image.caption}
                        onChange={(e) => updateCaption(index, e.target.value)}
                        className="mt-1 w-full text-sm border border-gray-300 rounded-md px-2 py-1"
                        placeholder="Caption"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

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