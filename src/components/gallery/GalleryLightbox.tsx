'use client';

import { useEffect, useCallback } from 'react';
import Image from 'next/image';
import { XMarkIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { SelectedImage } from '@/types/gallery';

interface GalleryLightboxProps {
  selectedImage: SelectedImage;
  onClose: () => void;
  onNavigate: (newIndex: number) => void;
}

export function GalleryLightbox({ selectedImage, onClose, onNavigate }: GalleryLightboxProps) {
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'ArrowLeft' && selectedImage.currentImageIndex > 0) {
      onNavigate(selectedImage.currentImageIndex - 1);
    } else if (
      e.key === 'ArrowRight' &&
      selectedImage.currentImageIndex < selectedImage.images.length - 1
    ) {
      onNavigate(selectedImage.currentImageIndex + 1);
    }
  }, [selectedImage, onClose, onNavigate]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center">
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white hover:text-gray-300 focus:outline-none"
      >
        <XMarkIcon className="h-8 w-8" />
      </button>

      {/* Navigation buttons */}
      {selectedImage.currentImageIndex > 0 && (
        <button
          onClick={() => onNavigate(selectedImage.currentImageIndex - 1)}
          className="absolute left-4 text-white hover:text-gray-300 focus:outline-none"
        >
          <ChevronLeftIcon className="h-8 w-8" />
        </button>
      )}
      {selectedImage.currentImageIndex < selectedImage.images.length - 1 && (
        <button
          onClick={() => onNavigate(selectedImage.currentImageIndex + 1)}
          className="absolute right-4 text-white hover:text-gray-300 focus:outline-none"
        >
          <ChevronRightIcon className="h-8 w-8" />
        </button>
      )}

      {/* Image */}
      <div className="relative w-full h-full max-w-7xl max-h-[90vh] mx-4">
        <Image
          src={selectedImage.images[selectedImage.currentImageIndex].url}
          alt={selectedImage.title}
          fill
          className="object-contain"
          sizes="100vw"
          priority
          quality={100}
        />
      </div>
    </div>
  );
} 