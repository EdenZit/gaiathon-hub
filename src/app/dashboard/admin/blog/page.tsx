'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { IBlogPost } from '@/models/BlogPost';
import { PlusIcon } from '@heroicons/react/24/outline';
import { BlogPostList } from '@/components/blog/BlogPostList';
import { BlogPostForm } from '@/components/blog/BlogPostForm';
import { getServerSession } from 'next-auth';

interface BlogFormData {
  title: string;
  excerpt: string;
  content: string;
  coverImage: string;
  category: string;
  tags: string[];
  status: 'draft' | 'published';
  seoTitle: string;
  seoDescription: string;
}

export default function BlogManagementPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<IBlogPost[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedPost, setSelectedPost] = useState<IBlogPost | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const res = await fetch('/api/blog?isAdmin=true');
      if (!res.ok) throw new Error('Failed to fetch blog posts');
      const data = await res.json();
      setPosts(data.posts);
    } catch (err) {
      console.error('Error fetching posts:', err);
      setError('Failed to load blog posts');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (formData: BlogFormData) => {
    try {
      // Calculate read time based on content length
      const wordCount = formData.content.split(/\s+/).length;
      const readTime = `${Math.ceil(wordCount / 200)} min read`;

      const postData = {
        ...formData,
        readTime,
        publishedAt: formData.status === 'published' ? new Date().toISOString() : null
      };

      const res = await fetch('/api/blog' + (selectedPost ? `/${selectedPost.slug}` : ''), {
        method: selectedPost ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postData)
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to save blog post');
      }

      // Reset form and refresh posts
      setIsEditing(false);
      setSelectedPost(null);
      await fetchPosts();
      router.refresh();
    } catch (err) {
      console.error('Error saving post:', err);
      setError(err instanceof Error ? err.message : 'Failed to save blog post');
    }
  };

  const handleEdit = (post: IBlogPost) => {
    setSelectedPost(post);
    setIsEditing(true);
  };

  const handleDelete = async (slug: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return;

    try {
      const res = await fetch(`/api/blog/${slug}`, {
        method: 'DELETE'
      });

      if (!res.ok) throw new Error('Failed to delete post');
      
      setPosts(posts.filter(post => post.slug !== slug));
      router.refresh();
    } catch (err) {
      console.error('Error deleting post:', err);
      setError('Failed to delete post');
    }
  };

  const handleStatusChange = async (slug: string, newStatus: 'draft' | 'published') => {
    try {
      const res = await fetch(`/api/blog/${slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          publishedAt: newStatus === 'published' ? new Date().toISOString() : null
        })
      });

      if (!res.ok) throw new Error('Failed to update post status');
      
      setPosts(posts.map(post => 
        post.slug === slug ? { ...post, status: newStatus } : post
      ));
      router.refresh();
    } catch (err) {
      console.error('Error updating post status:', err);
      setError('Failed to update post status');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Blog Management</h1>
        {!isEditing && (
          <button
            onClick={() => {
              setSelectedPost(null);
              setIsEditing(true);
            }}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Create New Post
          </button>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-4 text-gray-600">Loading blog posts...</p>
        </div>
      ) : (
        <>
          {/* Blog Posts List or Edit Form */}
          {!isEditing ? (
            <BlogPostList
              posts={posts}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onStatusChange={handleStatusChange}
            />
          ) : (
            <div className="bg-white shadow-sm rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  {selectedPost ? 'Edit Post' : 'Create New Post'}
                </h3>
                <BlogPostForm
                  initialData={selectedPost ? {
                    title: selectedPost.title,
                    excerpt: selectedPost.excerpt,
                    content: selectedPost.content,
                    coverImage: selectedPost.coverImage,
                    category: selectedPost.category,
                    tags: selectedPost.tags,
                    status: selectedPost.status,
                    seoTitle: selectedPost.title,
                    seoDescription: selectedPost.seoDescription || '',
                    authorName: selectedPost.author.name
                  } : undefined}
                  onSubmit={handleSubmit}
                  onCancel={() => {
                    setIsEditing(false);
                    setSelectedPost(null);
                    setError(null);
                  }}
                />
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
} 