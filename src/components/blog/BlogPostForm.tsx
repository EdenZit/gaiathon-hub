'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { RichTextEditor } from '@/components/shared/RichTextEditor';
import { TagInput } from '@/components/shared/TagInput';

interface BlogFormData {
  title: string;
  coverImage: string;
  excerpt: string;
  content: string;
  category: string;
  tags: string[];
  seoTitle: string;
  seoDescription: string;
  status: 'draft' | 'published';
  authorName: string;
  featuredOrder?: number;
}

interface BlogPostFormProps {
  initialData?: BlogFormData;
  onSubmit: (data: BlogFormData) => Promise<void>;
  onCancel: () => void;
}

export function BlogPostForm({ initialData, onSubmit, onCancel }: BlogPostFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [coverImagePreview, setCoverImagePreview] = useState<string>(initialData?.coverImage || '');
  const [error, setError] = useState<string | null>(null);
  const [isFeatured, setIsFeatured] = useState<boolean>(!!initialData?.featuredOrder);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<BlogFormData>({
    defaultValues: initialData || {
      title: '',
      coverImage: '',
      excerpt: '',
      content: '',
      category: '',
      tags: [],
      seoTitle: '',
      seoDescription: '',
      status: 'draft',
      authorName: '',
    },
  });

  // Initialize featuredOrder if it exists in initialData
  useEffect(() => {
    if (initialData?.featuredOrder) {
      setValue('featuredOrder', initialData.featuredOrder);
      setIsFeatured(true);
    }
  }, [initialData, setValue]);

  const handleFormSubmit = async (data: BlogFormData) => {
    try {
      setIsSubmitting(true);
      setError(null);

      // Validate required fields
      if (!data.coverImage) {
        setError('Cover image is required');
        return;
      }

      if (!data.content) {
        setError('Content is required');
        return;
      }

      await onSubmit(data);
    } catch (error) {
      console.error('Error submitting blog post:', error);
      setError(error instanceof Error ? error.message : 'Failed to save blog post');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        setIsSubmitting(true); // Show loading state
        console.log(`Uploading file: ${file.name}, size: ${file.size}, type: ${file.type}`);
        
        const formData = new FormData();
        formData.append('file', file);
        formData.append('context', 'cover');

        const res = await fetch('/api/blog/upload', {
          method: 'POST',
          body: formData
        });

        if (!res.ok) {
          const error = await res.json();
          console.error('Upload error response:', error);
          throw new Error(error.error || 'Failed to upload image');
        }

        const data = await res.json();
        console.log('Upload success:', data);
        setValue('coverImage', data.url);
        setCoverImagePreview(data.url);
      } catch (error) {
        console.error('Error uploading image:', error);
        // Show error message to the user
        setError(error instanceof Error ? error.message : 'Failed to upload image');
      } finally {
        setIsSubmitting(false); // Hide loading state
      }
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            {...register('title', { 
              required: 'Title is required',
              minLength: { value: 3, message: 'Title must be at least 3 characters' },
              maxLength: { value: 200, message: 'Title cannot exceed 200 characters' }
            })}
            className="mt-1 block w-full rounded-md border-2 border-gray-700 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
          {errors.title && (
            <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Post Author Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            {...register('authorName', { 
              required: 'Author name is required',
              minLength: { value: 2, message: 'Author name must be at least 2 characters' }
            })}
            className="mt-1 block w-full rounded-md border-2 border-gray-700 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
          <p className="mt-1 text-sm text-gray-500">Enter the name of the content author (this can be different from you, the admin)</p>
          {errors.authorName && (
            <p className="mt-1 text-sm text-red-600">{errors.authorName.message}</p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Cover Image <span className="text-red-500">*</span>
        </label>
        <div className="mt-1 relative">
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className={`block w-full border-2 border-gray-700 rounded-md p-2 ${isSubmitting ? 'opacity-50' : ''}`}
            disabled={isSubmitting}
          />
          {isSubmitting && (
            <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-70">
              <div className="w-6 h-6 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="ml-2 text-sm text-gray-700">Uploading...</span>
            </div>
          )}
        </div>
        {coverImagePreview ? (
          <div className="mt-2 relative">
            <img
              src={coverImagePreview}
              alt="Cover preview"
              className="h-48 w-full object-cover rounded-md"
            />
            <div className="absolute top-2 right-2">
              <button
                type="button"
                onClick={() => {
                  setValue('coverImage', '');
                  setCoverImagePreview('');
                }}
                className="bg-red-600 text-white p-1 rounded-full hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        ) : (
          <p className="mt-1 text-sm text-red-600">Cover image is required</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Excerpt <span className="text-red-500">*</span>
        </label>
        <textarea
          {...register('excerpt', { 
            required: 'Excerpt is required',
            maxLength: { value: 500, message: 'Excerpt cannot exceed 500 characters' }
          })}
          rows={3}
          className="mt-1 block w-full rounded-md border-2 border-gray-700 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
        {errors.excerpt && (
          <p className="mt-1 text-sm text-red-600">{errors.excerpt.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Content <span className="text-red-500">*</span>
        </label>
        <RichTextEditor
          value={watch('content')}
          onChange={(value) => setValue('content', value)}
        />
        {errors.content && (
          <p className="mt-1 text-sm text-red-600">{errors.content.message}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Category <span className="text-red-500">*</span>
          </label>
          <select
            {...register('category', { required: 'Category is required' })}
            className="mt-1 block w-full rounded-md border-2 border-gray-700 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="">Select a category</option>
            <option value="Earth Observation">Earth Observation</option>
            <option value="Technology">Technology</option>
            <option value="Tutorials">Tutorials</option>
            <option value="Success Stories">Success Stories</option>
            <option value="Events">Events</option>
            <option value="Research">Research</option>
          </select>
          {errors.category && (
            <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Feature Article
          </label>
          <div className="mt-1 flex items-center space-x-3">
            <input
              type="checkbox"
              id="featuredArticle"
              checked={isFeatured}
              onChange={(e) => {
                const isChecked = e.target.checked;
                console.log('Featured checkbox changed:', isChecked);
                setIsFeatured(isChecked);
                if (isChecked) {
                  setValue('featuredOrder', 1);
                } else {
                  setValue('featuredOrder', undefined);
                }
              }}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-700 rounded"
            />
            <label htmlFor="featuredArticle" className="text-sm text-gray-600">
              Make this a featured article
            </label>
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Featured articles appear prominently on the blog homepage
          </p>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Tags</label>
        <TagInput
          value={watch('tags')}
          onChange={(tags) => setValue('tags', tags)}
        />
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">SEO Settings</h3>
        <div>
          <label className="block text-sm font-medium text-gray-700">SEO Title</label>
          <input
            type="text"
            {...register('seoTitle')}
            className="mt-1 block w-full rounded-md border-2 border-gray-700 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">SEO Description</label>
          <textarea
            {...register('seoDescription')}
            rows={2}
            className="mt-1 block w-full rounded-md border-2 border-gray-700 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Status</label>
        <select
          {...register('status')}
          className="mt-1 block w-full rounded-md border-2 border-gray-700 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="draft">Draft</option>
          <option value="published">Published</option>
        </select>
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {isSubmitting ? 'Saving...' : 'Save Post'}
        </button>
      </div>
    </form>
  );
} 