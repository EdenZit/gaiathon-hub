'use client';

import { useState } from 'react';
import { GalleryCard } from './GalleryCard';
import { GalleryLightbox } from './GalleryLightbox';
import { IGalleryItem } from '@/models/Gallery';
import { SelectedImage } from '@/types/gallery';

interface GalleryGridProps {
  items: IGalleryItem[];
}

export function GalleryGrid({ items }: GalleryGridProps) {
  const [selectedImage, setSelectedImage] = useState<SelectedImage | null>(null);

  const handleNavigate = (newIndex: number) => {
    if (selectedImage) {
      setSelectedImage({
        ...selectedImage,
        currentImageIndex: newIndex
      });
    }
  };

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No images found in this category.</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item) => (
          <GalleryCard
            key={item._id.toString()}
            item={item}
            onSelect={setSelectedImage}
          />
        ))}
      </div>

      {/* Lightbox */}
      {selectedImage && (
        <GalleryLightbox
          selectedImage={selectedImage}
          onClose={() => setSelectedImage(null)}
          onNavigate={handleNavigate}
        />
      )}
    </>
  );
} 