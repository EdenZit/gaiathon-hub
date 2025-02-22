import React from 'react';
import Link from 'next/link';

export default function CategoriesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="py-4 bg-navy-700">
        <div className="container mx-auto px-4">
          <Link 
            href="/" 
            className="text-white hover:text-gray-200 transition-colors inline-flex items-center"
          >
            <span className="mr-2">←</span>
            Back to Home
          </Link>
        </div>
      </div>
      {children}
    </main>
  );
} 