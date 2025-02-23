import { Schema, model, models, Types } from 'mongoose';

export interface IBlogPost {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string;
  author: Types.ObjectId;
  category: string;
  tags: string[];
  readTime: string;
  status: 'draft' | 'published';
  featuredOrder?: number;
  seoDescription?: string;
  seoKeywords?: string[];
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const blogPostSchema = new Schema<IBlogPost>(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      minlength: [3, 'Title must be at least 3 characters long'],
      maxlength: [200, 'Title cannot exceed 200 characters']
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    excerpt: {
      type: String,
      required: [true, 'Excerpt is required'],
      trim: true,
      maxlength: [500, 'Excerpt cannot exceed 500 characters']
    },
    content: {
      type: String,
      required: [true, 'Content is required']
    },
    coverImage: {
      type: String,
      required: [true, 'Cover image is required']
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Author is required']
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: [
        'Earth Observation',
        'Technology',
        'Tutorials',
        'Success Stories',
        'Events',
        'Research'
      ]
    },
    tags: [{
      type: String,
      trim: true
    }],
    readTime: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ['draft', 'published'],
      default: 'draft'
    },
    featuredOrder: {
      type: Number,
      sparse: true
    },
    seoDescription: {
      type: String,
      maxlength: [160, 'SEO description cannot exceed 160 characters']
    },
    seoKeywords: [{
      type: String,
      trim: true
    }],
    publishedAt: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

// Add indexes for better query performance
blogPostSchema.index({ slug: 1 }, { unique: true });
blogPostSchema.index({ category: 1, status: 1 });
blogPostSchema.index({ status: 1, publishedAt: -1 });
blogPostSchema.index({ tags: 1 });
blogPostSchema.index({ featuredOrder: 1 }, { sparse: true });

// Create text index for search functionality
blogPostSchema.index(
  { 
    title: 'text',
    excerpt: 'text',
    content: 'text'
  },
  {
    weights: {
      title: 10,
      excerpt: 5,
      content: 1
    }
  }
);

// Pre-save middleware to generate slug if not provided
blogPostSchema.pre('save', function(next) {
  if (!this.isModified('title')) {
    return next();
  }

  this.slug = this.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  
  next();
});

export const BlogPost = models.BlogPost || model<IBlogPost>('BlogPost', blogPostSchema); 