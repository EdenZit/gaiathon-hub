import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { CalendarDaysIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import { BlogPost, IBlogPost } from '@/models/BlogPost';
import { connectDB } from '@/lib/mongodb';
import { Types } from 'mongoose';

export const metadata: Metadata = {
  title: 'Blog | GAIAthon-Hub Resources',
  description: 'Explore articles, tutorials, and insights about Earth Observation, technology innovation, and GAIAthon updates.',
};

type MongoDoc<T> = T & {
  _id: Types.ObjectId;
  __v: number;
};

interface PopulatedAuthor {
  _id: Types.ObjectId;
  name: string;
  image?: string;
}

interface BlogPostWithAuthor extends Omit<IBlogPost, 'author'> {
  _id: Types.ObjectId;
  author: PopulatedAuthor;
}

async function getFeaturedPosts(): Promise<BlogPostWithAuthor[]> {
  await connectDB();
  const posts = await BlogPost.find({ 
    status: 'published',
    featuredOrder: { $exists: true }
  })
    .sort({ featuredOrder: 1 })
    .limit(2)
    .populate<{ author: PopulatedAuthor }>('author', 'name image')
    .lean();

  return posts as unknown as BlogPostWithAuthor[];
}

async function getRecentPosts(): Promise<BlogPostWithAuthor[]> {
  await connectDB();
  const posts = await BlogPost.find({ 
    status: 'published',
    featuredOrder: { $exists: false }
  })
    .sort({ publishedAt: -1 })
    .limit(3)
    .populate<{ author: PopulatedAuthor }>('author', 'name image')
    .lean();

  return posts as unknown as BlogPostWithAuthor[];
}

export default async function BlogPage() {
  const [featuredPosts, recentPosts] = await Promise.all([
    getFeaturedPosts(),
    getRecentPosts()
  ]);

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
        {/* Featured Posts */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Featured Articles</h2>
          <div className="space-y-8">
            {featuredPosts.map((post) => (
              <article
                key={post._id.toString()}
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
                    <Link href={`/resources/blog/${post.slug}`} className="hover:text-blue-600">
                      {post.title}
                    </Link>
                  </h3>
                  <p className="text-gray-600 mb-4">{post.excerpt}</p>
                  <div className="flex items-center text-sm text-gray-500">
                    <UserCircleIcon className="h-5 w-5 mr-2" />
                    <span>{post.author.name}</span>
                    <span className="mx-2">•</span>
                    <CalendarDaysIcon className="h-5 w-5 mr-2" />
                    <span>
                      {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      }) : 'Draft'}
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Recent Posts */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Posts</h2>
          <div className="grid gap-8 md:grid-cols-3">
            {recentPosts.map((post) => (
              <article
                key={post._id.toString()}
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
                    <Link href={`/resources/blog/${post.slug}`} className="hover:text-blue-600">
                      {post.title}
                    </Link>
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">{post.excerpt}</p>
                  <div className="flex items-center text-sm text-gray-500">
                    <UserCircleIcon className="h-5 w-5 mr-2" />
                    <span>{post.author.name}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
} 