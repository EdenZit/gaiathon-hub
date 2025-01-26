export interface GalleryImage {
  url: string;
  caption: string;
}

export interface GalleryItem {
  id: number;
  category: 'all' | 'teams' | 'workshops' | 'visits' | 'social';
  title: string;
  description: string;
  images: GalleryImage[];
}

export interface SelectedImage extends GalleryItem {
  currentImageIndex: number;
}

export type GalleryFilter = GalleryItem['category'] | 'all'; 