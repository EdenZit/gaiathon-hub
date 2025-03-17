import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { BlogPost } from '@/models/BlogPost';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    await connectDB();

    const post = await BlogPost.findOne({
      slug: params.slug,
      status: 'published'
    }).populate('author', 'name image');

    if (!post) {
      return NextResponse.json(
        { error: 'Blog post not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(post);
  } catch (error: any) {
    console.error('Error fetching blog post:', error);
    return NextResponse.json(
      { error: 'Failed to fetch blog post' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
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
    const { slug } = params;
    
    console.log('PUT request body:', body);
    console.log('Current slug:', slug);

    // Handle featured order changes
    if (body.featuredOrder !== undefined) {
      console.log('Handling featured order change. New featuredOrder:', body.featuredOrder);
      
      // If making this post featured
      if (body.featuredOrder) {
        console.log('Making this post featured. Removing featured status from other posts...');
        // Remove featured status from all other posts
        const result = await BlogPost.updateMany(
          { slug: { $ne: slug } }, // Don't unset the current post
          { $unset: { featuredOrder: "" } }
        );
        console.log('UpdateMany result:', result);
        
        // Set this post as the only featured one
        body.featuredOrder = 1;
        console.log('Set featuredOrder to 1');
      }
    }

    const updatedPost = await BlogPost.findOneAndUpdate(
      { slug },
      {
        $set: {
          ...body,
          updatedAt: new Date()
        }
      },
      { new: true }
    );

    console.log('Updated post result:', updatedPost);

    if (!updatedPost) {
      return NextResponse.json(
        { error: 'Blog post not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedPost);
  } catch (error: any) {
    console.error('Error updating blog post:', error);
    return NextResponse.json(
      { 
        error: 'Failed to update blog post',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    // Get the session to verify the user is authenticated
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    console.log(`Attempting to delete blog post with slug: ${params.slug}`);
    
    await connectDB();

    // Find the post first to check if it exists
    const postToDelete = await BlogPost.findOne({ slug: params.slug });
    
    if (!postToDelete) {
      console.log(`Blog post with slug ${params.slug} not found`);
      return NextResponse.json(
        { error: 'Blog post not found' },
        { status: 404 }
      );
    }

    console.log(`Found blog post to delete: ${postToDelete.title}`);

    // Delete the post
    const result = await BlogPost.deleteOne({ slug: params.slug });
    
    if (result.deletedCount === 0) {
      console.error(`Failed to delete blog post with slug: ${params.slug}`);
      return NextResponse.json(
        { error: 'Failed to delete blog post' },
        { status: 500 }
      );
    }

    console.log(`Successfully deleted blog post with slug: ${params.slug}`);

    return NextResponse.json(
      { 
        message: 'Blog post deleted successfully',
        slug: params.slug
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error deleting blog post:', error);
    return NextResponse.json(
      { 
        error: 'Failed to delete blog post',
        details: error.message,
        slug: params.slug
      },
      { status: 500 }
    );
  }
} 