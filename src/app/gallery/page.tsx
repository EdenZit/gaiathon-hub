'use client';

import { useState } from 'react';
import { GalleryCard } from '@/components/gallery/GalleryCard';
import { GalleryLightbox } from '@/components/gallery/GalleryLightbox';
import { GalleryItem, SelectedImage, GalleryFilter } from '@/types/gallery';

const CATEGORIES = ['all', 'teams', 'workshops', 'visits', 'social'] as const;

// Example data structure with multiple images per item
const galleryItems: GalleryItem[] = [
  {
    id: 1,
    category: 'teams',
    title: 'Team Alpha Project',
    description: 'Working on sustainable energy solutions',
    images: [
      { url: '/images/gallery/team-1-1.jpg', caption: 'Team brainstorming session' },
      { url: '/images/gallery/team-1-2.jpg', caption: 'Prototype development' },
      { url: '/images/gallery/team-1-3.jpg', caption: 'Final presentation' }
    ]
  },
  {
    id: 2,
    category: 'workshops',
    title: 'AI Workshop Series',
    description: 'Three-day intensive workshop on artificial intelligence',
    images: [
      { url: '/images/gallery/workshop-1-1.jpg', caption: 'Day 1: Introduction to AI' },
      { url: '/images/gallery/workshop-1-2.jpg', caption: 'Day 2: Hands-on Training' }
    ]
  },
  {
    id: 3,
    category: 'social',
    title: 'Networking Event',
    description: 'Evening of connections and conversations',
    images: [
      { url: '/images/gallery/social-1-1.jpg', caption: 'Welcome session' },
      { url: '/images/gallery/social-1-2.jpg', caption: 'Group discussions' },
      { url: '/images/gallery/social-1-3.jpg', caption: 'Team building activities' }
    ]
  }
];

export default function GalleryPage() {
  const [selectedImage, setSelectedImage] = useState<SelectedImage | null>(null);
  const [filter, setFilter] = useState<GalleryFilter>('all');

  const filteredItems = filter === 'all' 
    ? galleryItems 
    : galleryItems.filter(item => item.category === filter);

  const handleNavigate = (newIndex: number) => {
    if (selectedImage) {
      setSelectedImage({
        ...selectedImage,
        currentImageIndex: newIndex
      });
    }
  };

  const handleFilterChange = (category: string) => {
    setFilter(category as GalleryFilter);
    setSelectedImage(null); // Close lightbox when changing categories
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-2">GAIAthon Gallery</h1>
        <p className="text-gray-600">Browse through our collection of memories and achievements</p>
      </div>

      {/* Filter Buttons */}
      <div className="flex flex-wrap justify-center gap-2 mb-8">
        {CATEGORIES.map((category) => (
          <button
            key={category}
            onClick={() => handleFilterChange(category)}
            className={`px-4 py-2 rounded-full text-sm transition-colors ${
              filter === category 
                ? 'bg-blue-600 text-white' 
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </button>
        ))}
      </div>

      {/* Gallery Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map((item) => (
          <GalleryCard
            key={item.id}
            item={item}
            onSelect={setSelectedImage}
          />
        ))}
      </div>

      {/* Empty State */}
      {filteredItems.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No images found in this category.</p>
        </div>
      )}

      {/* Lightbox */}
      {selectedImage && (
        <GalleryLightbox
          selectedImage={selectedImage}
          onClose={() => setSelectedImage(null)}
          onNavigate={handleNavigate}
        />
      )}
    </div>
  );
} 