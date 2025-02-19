export function TeamsSkeleton() {
  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg animate-pulse">
      <div className="divide-y divide-gray-200">
        {[...Array(3)].map((_, index) => (
          <div key={index} className="px-6 py-4">
            <div className="flex flex-col space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="h-6 w-48 bg-gray-200 rounded"></div>
                  <div className="h-4 w-32 bg-gray-200 rounded mt-2"></div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="h-8 w-24 bg-gray-200 rounded-full"></div>
                  <div className="flex space-x-2">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="h-8 w-8 bg-gray-200 rounded"></div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="bg-gray-50 p-4 rounded-lg">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="h-5 w-32 bg-gray-200 rounded"></div>
                        <div className="h-5 w-16 bg-gray-200 rounded"></div>
                      </div>
                      <div className="h-4 w-40 bg-gray-200 rounded"></div>
                      <div className="h-4 w-36 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 