import { Schema, model, models, Types } from 'mongoose';

export interface IGalleryImage {
  _id?: string;
  url: string;
  caption: string;
}

export interface IGalleryItem {
  _id?: string;
  title: string;
  description: string;
  category: 'teams' | 'workshops' | 'visits' | 'social';
  images: IGalleryImage[];
  createdAt: Date;
  updatedAt: Date;
  uploadedBy: {
    _id: string;
    name: string;
    image?: string;
  };
  featuredOrder?: number;
}

const galleryImageSchema = new Schema<IGalleryImage>({
  url: {
    type: String,
    required: [true, 'Image URL is required']
  },
  caption: {
    type: String,
    required: [true, 'Image caption is required'],
    trim: true,
    maxlength: [200, 'Caption cannot exceed 200 characters']
  }
});

const galleryItemSchema = new Schema<IGalleryItem>(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      minlength: [3, 'Title must be at least 3 characters long'],
      maxlength: [100, 'Title cannot exceed 100 characters']
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters']
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: {
        values: ['teams', 'workshops', 'visits', 'social'],
        message: 'Invalid category'
      }
    },
    images: {
      type: [galleryImageSchema],
      required: [true, 'At least one image is required'],
      validate: {
        validator: function(images: IGalleryImage[]) {
          return images.length > 0;
        },
        message: 'Gallery item must have at least one image'
      }
    },
    uploadedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Uploader is required']
    },
    featuredOrder: {
      type: Number,
      sparse: true,
      index: true
    }
  },
  {
    timestamps: true,
    toJSON: {
      transform: function(doc, ret) {
        // Only transform if the _id exists and is an ObjectId
        if (ret._id && typeof ret._id.toString === 'function') {
          ret._id = ret._id.toString();
        }
        // Only transform uploadedBy if it exists and has an _id
        if (ret.uploadedBy && ret.uploadedBy._id && typeof ret.uploadedBy._id.toString === 'function') {
          ret.uploadedBy._id = ret.uploadedBy._id.toString();
        }
        // Transform image _ids if they exist
        if (Array.isArray(ret.images)) {
          ret.images = ret.images.map((image: any) => ({
            ...image,
            _id: image._id && typeof image._id.toString === 'function' ? image._id.toString() : image._id
          }));
        }
        return ret;
      }
    }
  }
);

// Add indexes for better query performance
galleryItemSchema.index({ category: 1, createdAt: -1 });
galleryItemSchema.index({ uploadedBy: 1 });

export const Gallery = models.Gallery || model<IGalleryItem>('Gallery', galleryItemSchema); 