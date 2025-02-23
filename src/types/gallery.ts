import { Types } from 'mongoose';

export interface GalleryImage {
  url: string;
  caption: string;
}

export interface GalleryItem {
  _id: Types.ObjectId;
  category: 'teams' | 'workshops' | 'visits' | 'social';
  title: string;
  description: string;
  images: GalleryImage[];
  uploadedBy: {
    _id: Types.ObjectId;
    name: string;
    image?: string;
  };
  createdAt: Date;
  updatedAt: Date;
  featuredOrder?: number;
}

export interface SelectedImage extends GalleryItem {
  currentImageIndex: number;
}

export type GalleryFilter = GalleryItem['category'] | 'all'; 