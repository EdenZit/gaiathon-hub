import { Suspense } from 'react';
import { GalleryCard } from '@/components/gallery/GalleryCard';
import { GalleryLightbox } from '@/components/gallery/GalleryLightbox';
import { GalleryFilter } from '@/types/gallery';
import { Gallery, IGalleryItem } from '@/models/Gallery';
import { connectDB } from '@/lib/mongodb';
import GalleryLoading from './loading';
import { GalleryGrid } from '@/components/gallery/GalleryGrid';

const CATEGORIES = ['all', 'teams', 'workshops', 'visits', 'social'] as const;

// Fetch gallery items with server-side rendering
async function getGalleryItems(category?: string): Promise<IGalleryItem[]> {
  await connectDB();
  const query = category && category !== 'all' ? { category } : {};
  
  const items = await Gallery.find(query)
    .sort({ featuredOrder: 1, createdAt: -1 })
    .populate('uploadedBy', 'name image')
    .lean();

  // Convert Mongoose documents to plain objects and serialize ObjectIds
  return JSON.parse(JSON.stringify(items));
}

export default async function GalleryPage({
  searchParams
}: {
  searchParams: { category?: string }
}) {
  const category = searchParams.category as GalleryFilter;
  const items = await getGalleryItems(category);

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-2">GAIAthon Gallery</h1>
        <p className="text-gray-600">Browse through our collection of memories and achievements</p>
      </div>

      {/* Filter Buttons */}
      <div className="flex flex-wrap justify-center gap-2 mb-8">
        {CATEGORIES.map((cat) => (
          <a
            key={cat}
            href={`/gallery${cat === 'all' ? '' : `?category=${cat}`}`}
            className={`px-4 py-2 rounded-full text-sm transition-colors ${
              (!category && cat === 'all') || category === cat
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            {cat.charAt(0).toUpperCase() + cat.slice(1)}
          </a>
        ))}
      </div>

      {/* Gallery Grid with Suspense */}
      <Suspense fallback={<GalleryLoading />}>
        <GalleryGrid items={items} />
      </Suspense>
    </div>
  );
} 