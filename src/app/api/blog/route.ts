import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { BlogPost } from '@/models/BlogPost';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const category = searchParams.get('category');
    const tag = searchParams.get('tag');
    const search = searchParams.get('search');
    const isAdmin = searchParams.get('isAdmin') === 'true';

    // Only filter by published status if not in admin view
    const query: any = !isAdmin ? { status: 'published' } : {};

    if (category) {
      query.category = category;
    }

    if (tag) {
      query.tags = tag;
    }

    if (search) {
      query.$text = { $search: search };
    }

    const skip = (page - 1) * limit;

    const [posts, totalPosts] = await Promise.all([
      BlogPost.find(query)
        .sort({ updatedAt: -1 }) // Show most recently updated first
        .skip(skip)
        .limit(limit)
        .lean(),
      BlogPost.countDocuments(query)
    ]);

    return NextResponse.json({
      posts,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalPosts / limit),
        totalPosts
      }
    });
  } catch (error: any) {
    console.error('Error fetching blog posts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch blog posts' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    await connectDB();

    const body = await request.json();

    // Calculate read time based on content length (assuming average reading speed of 200 words per minute)
    const wordCount = body.content.split(/\s+/).length;
    const readTime = `${Math.ceil(wordCount / 200)} min read`;

    // If this is a featured article, get the highest featuredOrder and increment
    let featuredOrder;
    if (body.featuredOrder !== undefined) {
      const highestFeatured = await BlogPost.findOne({})
        .sort({ featuredOrder: -1 })
        .select('featuredOrder')
        .lean<{ featuredOrder?: number }>();
      
      featuredOrder = highestFeatured?.featuredOrder ? highestFeatured.featuredOrder + 1 : 1;
    }
    
    // Create the blog post
    const post = new BlogPost({
      title: body.title,
      excerpt: body.excerpt,
      content: body.content,
      coverImage: body.coverImage,
      category: body.category,
      tags: body.tags || [],
      status: body.status,
      readTime,
      seoTitle: body.seoTitle,
      seoDescription: body.seoDescription,
      createdBy: session.user.id,
      author: { name: body.authorName },
      slug: body.slug || body.title.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, ''),
      featuredOrder: featuredOrder,
      publishedAt: body.status === 'published' ? new Date() : undefined
    });

    await post.save();

    return NextResponse.json(post, { status: 201 });
  } catch (error: any) {
    console.error('Error creating blog post:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create blog post',
        details: error.message 
      },
      { status: 500 }
    );
  }
} 