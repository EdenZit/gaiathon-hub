'use client';

import { useState, useEffect } from 'react';
import { GalleryItem, SelectedImage } from '@/types/gallery';
import Image from 'next/image';
import { CalendarDaysIcon, PhotoIcon } from '@heroicons/react/24/outline';

interface GalleryCardProps {
  item: GalleryItem;
  onSelect: (selected: SelectedImage) => void;
}

export function GalleryCard({ item, onSelect }: GalleryCardProps) {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Try next image if current one fails
  const tryNextImage = () => {
    if (currentImageIndex < item.images.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1);
      setImageError(false);
      setIsLoading(true);
    } else {
      setImageError(true);
      setIsLoading(false);
    }
  };

  // Reset state when item changes
  useEffect(() => {
    setImageError(false);
    setIsLoading(true);
    setCurrentImageIndex(0);
  }, [item]);

  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      {/* Image Preview */}
      <div 
        className="relative w-full pt-[56.25%] cursor-pointer group bg-gray-100"
        onClick={() => !imageError && onSelect({ ...item, currentImageIndex })}
      >
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-pulse bg-gray-200 w-full h-full" />
          </div>
        )}
        
        {!imageError ? (
          <Image
            src={item.images[currentImageIndex].url}
            alt={item.images[currentImageIndex].caption}
            fill
            className={`object-cover rounded-t-lg transition-opacity duration-300 ${
              isLoading ? 'opacity-0' : 'opacity-100'
            }`}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority={currentImageIndex === 0}
            quality={85}
            onLoad={() => {
              setIsLoading(false);
            }}
            onError={() => {
              console.error('Error loading image:', item.images[currentImageIndex].url);
              tryNextImage();
            }}
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100 p-4">
            <PhotoIcon className="h-12 w-12 text-gray-400 mb-2" />
            <span className="text-gray-500 text-sm text-center">Image not available</span>
          </div>
        )}

        {!imageError && item.images.length > 1 && (
          <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
            +{item.images.length - 1} more
          </div>
        )}
        <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity" />
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-lg mb-1">{item.title}</h3>
        <p className="text-gray-600 mb-2">{item.description}</p>
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span className="capitalize">{item.category}</span>
          <div className="flex items-center">
            <CalendarDaysIcon className="h-5 w-5 mr-1" />
            <span>
              {new Date(item.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              })}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
} 