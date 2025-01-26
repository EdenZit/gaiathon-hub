'use client';

import { SelectedImage } from '@/types/gallery';
import { XMarkIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import { useCallback, useEffect } from 'react';

interface GalleryLightboxProps {
  selectedImage: SelectedImage;
  onClose: () => void;
  onNavigate: (newIndex: number) => void;
}

export function GalleryLightbox({ selectedImage, onClose, onNavigate }: GalleryLightboxProps) {
  const handleKeyPress = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'ArrowLeft' && selectedImage.images.length > 1) {
      const newIndex = (selectedImage.currentImageIndex - 1 + selectedImage.images.length) % selectedImage.images.length;
      onNavigate(newIndex);
    } else if (e.key === 'ArrowRight' && selectedImage.images.length > 1) {
      const newIndex = (selectedImage.currentImageIndex + 1) % selectedImage.images.length;
      onNavigate(newIndex);
    }
  }, [selectedImage, onClose, onNavigate]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  const navigatePrev = () => {
    const newIndex = (selectedImage.currentImageIndex - 1 + selectedImage.images.length) % selectedImage.images.length;
    onNavigate(newIndex);
  };

  const navigateNext = () => {
    const newIndex = (selectedImage.currentImageIndex + 1) % selectedImage.images.length;
    onNavigate(newIndex);
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors"
        aria-label="Close lightbox"
      >
        <XMarkIcon className="h-6 w-6" />
      </button>
      
      <div className="max-w-4xl w-full relative">
        {/* Navigation Buttons */}
        {selectedImage.images.length > 1 && (
          <>
            <button
              onClick={navigatePrev}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 transition-colors z-10"
              aria-label="Previous image"
            >
              <ChevronLeftIcon className="h-9 w-9" />
            </button>
            <button
              onClick={navigateNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 transition-colors z-10"
              aria-label="Next image"
            >
              <ChevronRightIcon className="h-9 w-9" />
            </button>
          </>
        )}
        
        {/* Current Image */}
        <div className="relative aspect-video w-full">
          <Image
            src={selectedImage.images[selectedImage.currentImageIndex].url}
            alt={selectedImage.images[selectedImage.currentImageIndex].caption}
            fill
            className="object-contain rounded-lg"
            sizes="(max-width: 1536px) 100vw, 1536px"
            priority
          />
        </div>
        
        {/* Caption and Info */}
        <div className="text-white mt-4 text-center">
          <h3 className="text-xl font-semibold mb-2">{selectedImage.title}</h3>
          <p className="mb-2">{selectedImage.images[selectedImage.currentImageIndex].caption}</p>
          <div className="space-y-2">
            <p className="text-sm text-gray-300">
              Image {selectedImage.currentImageIndex + 1} of {selectedImage.images.length}
            </p>
            <button
              onClick={onClose}
              className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
            >
              Back to Gallery
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 