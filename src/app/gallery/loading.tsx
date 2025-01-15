export default function GalleryLoading() {
  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="text-center mb-8">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mx-auto mb-2" />
        <div className="h-4 w-96 bg-gray-200 rounded animate-pulse mx-auto" />
      </div>

      <div className="flex flex-wrap justify-center gap-2 mb-8">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="h-8 w-24 bg-gray-200 rounded-full animate-pulse"
          />
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-white rounded-lg overflow-hidden shadow-sm">
            <div className="aspect-video bg-gray-200 animate-pulse" />
            <div className="p-4 space-y-2">
              <div className="h-6 w-3/4 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
              <div className="h-4 w-1/4 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 