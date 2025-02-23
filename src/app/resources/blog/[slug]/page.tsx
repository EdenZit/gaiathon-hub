import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CalendarDaysIcon, UserCircleIcon, TagIcon } from '@heroicons/react/24/outline';
import { connectDB } from '@/lib/mongodb';
import { BlogPost, IBlogPost } from '@/models/BlogPost';
import { Types } from 'mongoose';

interface PopulatedAuthor {
  _id: Types.ObjectId;
  name: string;
  image?: string;
}

interface BlogPostWithAuthor extends Omit<IBlogPost, 'author'> {
  _id: Types.ObjectId;
  author: PopulatedAuthor;
}

// Generate metadata for the page
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  await connectDB();
  const post = await BlogPost.findOne({ 
    slug: params.slug,
    status: 'published'
  })
    .populate<{ author: PopulatedAuthor }>('author', 'name')
    .lean() as unknown as BlogPostWithAuthor;

  if (!post) {
    return {
      title: 'Post Not Found | GAIAthon-Hub',
      description: 'The requested blog post could not be found.'
    };
  }

  return {
    title: `${post.title} | GAIAthon-Hub Blog`,
    description: post.seoDescription || post.excerpt,
    keywords: post.seoKeywords,
    openGraph: {
      title: post.title,
      description: post.seoDescription || post.excerpt,
      images: [post.coverImage]
    }
  };
}

// Get related posts based on category and tags
async function getRelatedPosts(currentPost: BlogPostWithAuthor): Promise<BlogPostWithAuthor[]> {
  const posts = await BlogPost.find({
    _id: { $ne: currentPost._id },
    status: 'published',
    $or: [
      { category: currentPost.category },
      { tags: { $in: currentPost.tags } }
    ]
  })
    .limit(3)
    .populate<{ author: PopulatedAuthor }>('author', 'name image')
    .lean();

  return posts as unknown as BlogPostWithAuthor[];
}

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  await connectDB();
  
  const post = await BlogPost.findOne({ 
    slug: params.slug,
    status: 'published'
  })
    .populate<{ author: PopulatedAuthor }>('author', 'name image')
    .lean() as unknown as BlogPostWithAuthor;

  if (!post) {
    notFound();
  }

  const relatedPosts = await getRelatedPosts(post);

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative h-[60vh] min-h-[400px] w-full">
        <Image
          src={post.coverImage}
          alt={post.title}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black bg-opacity-40">
          <div className="max-w-4xl mx-auto h-full flex items-end px-4 sm:px-6 lg:px-8 pb-16">
            <div className="text-white">
              <div className="flex items-center space-x-2 mb-4">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-500 bg-opacity-80">
                  {post.category}
                </span>
                <span>•</span>
                <span>{post.readTime}</span>
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold mb-4">
                {post.title}
              </h1>
              <div className="flex items-center text-sm">
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
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-xl shadow-sm p-8">
          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex items-center gap-2 mb-8">
              <TagIcon className="h-5 w-5 text-gray-500" />
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag: string) => (
                  <Link
                    key={tag}
                    href={`/resources/blog/tag/${tag.toLowerCase().replace(' ', '-')}`}
                    className="text-sm px-3 py-1 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
                  >
                    {tag}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Article Content */}
          <article className="prose prose-lg max-w-none">
            <div dangerouslySetInnerHTML={{ __html: post.content }} />
          </article>
        </div>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <section className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Related Articles</h2>
            <div className="grid gap-8 md:grid-cols-3">
              {relatedPosts.map((relatedPost) => (
                <article
                  key={relatedPost._id.toString()}
                  className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="relative h-48">
                    <Image
                      src={relatedPost.coverImage}
                      alt={relatedPost.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      <Link href={`/resources/blog/${relatedPost.slug}`} className="hover:text-blue-600">
                        {relatedPost.title}
                      </Link>
                    </h3>
                    <p className="text-gray-600 text-sm mb-4">{relatedPost.excerpt}</p>
                    <div className="flex items-center text-sm text-gray-500">
                      <UserCircleIcon className="h-5 w-5 mr-2" />
                      <span>{relatedPost.author.name}</span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
} 