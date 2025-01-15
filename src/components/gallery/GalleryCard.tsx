'use client';

import { GalleryItem, SelectedImage } from '@/types/gallery';
import Image from 'next/image';

interface GalleryCardProps {
  item: GalleryItem;
  onSelect: (selected: SelectedImage) => void;
}

export function GalleryCard({ item, onSelect }: GalleryCardProps) {
  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      {/* Image Preview (shows first image) */}
      <div 
        className="aspect-video cursor-pointer relative group"
        onClick={() => onSelect({ ...item, currentImageIndex: 0 })}
      >
        <Image
          src={item.images[0].url}
          alt={item.images[0].caption}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        {item.images.length > 1 && (
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
        <p className="text-sm text-gray-500 capitalize">{item.category}</p>
      </div>
    </div>
  )
} 