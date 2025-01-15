import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { CalendarDaysIcon, UserCircleIcon, TagIcon } from '@heroicons/react/24/outline';

interface BlogPost {
  id: number;
  title: string;
  excerpt: string;
  coverImage: string;
  author: string;
  date: string;
  category: string;
  readTime: string;
}

export const metadata: Metadata = {
  title: 'Blog | GAIAthon-Hub Resources',
  description: 'Explore articles, tutorials, and insights about Earth Observation, technology innovation, and GAIAthon updates.',
};

// Sample blog data - to be replaced with actual data from a CMS or API
const featuredPosts: BlogPost[] = [
  {
    id: 1,
    title: 'Leveraging Earth Observation for Climate Action',
    excerpt: 'Discover how GAIAthon participants are using satellite data to address climate challenges in Africa.',
    coverImage: '/images/blog/featured-1.jpg',
    author: 'Dr. Sarah Johnson',
    date: 'January 15, 2025',
    category: 'Earth Observation',
    readTime: '5 min read'
  },
  {
    id: 2,
    title: 'Innovation in Environmental Monitoring',
    excerpt: 'How modern technology is revolutionizing the way we monitor and protect our environment.',
    coverImage: '/images/blog/featured-2.jpg',
    author: 'Prof. Michael Chen',
    date: 'January 10, 2025',
    category: 'Technology',
    readTime: '7 min read'
  }
];

const recentPosts: BlogPost[] = [
  {
    id: 3,
    title: 'Getting Started with WEkEO Data Services',
    excerpt: 'A comprehensive guide to accessing and utilizing WEkEO data services for your projects.',
    coverImage: '/images/blog/post-1.jpg',
    author: 'James Wilson',
    date: 'January 5, 2025',
    category: 'Tutorials',
    readTime: '10 min read'
  },
  {
    id: 4,
    title: 'Success Stories: GAIAthon 2024 Winners',
    excerpt: "Meet the innovative teams that created impactful solutions in last year's challenge.",
    coverImage: '/images/blog/post-2.jpg',
    author: 'Emma Rodriguez',
    date: 'December 30, 2024',
    category: 'Success Stories',
    readTime: '8 min read'
  },
  {
    id: 5,
    title: 'The Future of Remote Sensing Technology',
    excerpt: 'Exploring upcoming trends and innovations in satellite technology and remote sensing.',
    coverImage: '/images/blog/post-3.jpg',
    author: 'Dr. Alex Kumar',
    date: 'December 25, 2024',
    category: 'Technology',
    readTime: '6 min read'
  }
];

const categories = [
  { name: 'Earth Observation', count: 12 },
  { name: 'Technology', count: 8 },
  { name: 'Tutorials', count: 15 },
  { name: 'Success Stories', count: 6 },
  { name: 'Events', count: 4 },
  { name: 'Research', count: 7 }
];

export default function BlogPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-extrabold text-gray-900 text-center mb-4">
            GAIAthon Blog
          </h1>
          <p className="text-xl text-gray-600 text-center max-w-3xl mx-auto">
            Explore the latest insights, tutorials, and success stories from the GAIAthon community
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Featured Posts */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Featured Articles</h2>
              <div className="space-y-8">
                {featuredPosts.map((post) => (
                  <article
                    key={post.id}
                    className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                  >
                    <div className="relative h-64">
                      <Image
                        src={post.coverImage}
                        alt={post.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="p-6">
                      <div className="flex items-center space-x-2 text-sm text-gray-500 mb-3">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {post.category}
                        </span>
                        <span>•</span>
                        <span>{post.readTime}</span>
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        <Link href={`/resources/blog/${post.id}`} className="hover:text-blue-600">
                          {post.title}
                        </Link>
                      </h3>
                      <p className="text-gray-600 mb-4">{post.excerpt}</p>
                      <div className="flex items-center text-sm text-gray-500">
                        <UserCircleIcon className="h-5 w-5 mr-2" />
                        <span>{post.author}</span>
                        <span className="mx-2">•</span>
                        <CalendarDaysIcon className="h-5 w-5 mr-2" />
                        <span>{post.date}</span>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            {/* Recent Posts */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Posts</h2>
              <div className="grid gap-8 md:grid-cols-2">
                {recentPosts.map((post) => (
                  <article
                    key={post.id}
                    className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                  >
                    <div className="relative h-48">
                      <Image
                        src={post.coverImage}
                        alt={post.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="p-6">
                      <div className="flex items-center space-x-2 text-sm text-gray-500 mb-3">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {post.category}
                        </span>
                        <span>•</span>
                        <span>{post.readTime}</span>
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 mb-2">
                        <Link href={`/resources/blog/${post.id}`} className="hover:text-blue-600">
                          {post.title}
                        </Link>
                      </h3>
                      <p className="text-gray-600 text-sm mb-4">{post.excerpt}</p>
                      <div className="flex items-center text-sm text-gray-500">
                        <UserCircleIcon className="h-5 w-5 mr-2" />
                        <span>{post.author}</span>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Categories */}
            <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Categories</h3>
              <div className="space-y-2">
                {categories.map((category) => (
                  <Link
                    key={category.name}
                    href={`/resources/blog/category/${category.name.toLowerCase().replace(' ', '-')}`}
                    className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <span className="text-gray-600">{category.name}</span>
                    <span className="text-sm text-gray-500">{category.count}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Newsletter Signup */}
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-sm p-6 text-white">
              <h3 className="text-lg font-bold mb-2">Stay Updated</h3>
              <p className="text-blue-100 mb-4">
                Get the latest articles and updates delivered to your inbox.
              </p>
              <form className="space-y-3">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full px-4 py-2 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-300"
                />
                <button
                  type="submit"
                  className="w-full bg-white text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-blue-50 transition-colors"
                >
                  Subscribe
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
} 