import { Schema, model, models, Types } from 'mongoose';

export interface IDocument {
  title: string;
  description: string;
  type: 'text' | 'code' | 'markdown';
  visibility: 'private' | 'team' | 'public';
  content: string;
  owner: Types.ObjectId;
  team?: Types.ObjectId;
  collaborators: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const documentSchema = new Schema<IDocument>(
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
    type: {
      type: String,
      required: [true, 'Document type is required'],
      enum: {
        values: ['text', 'code', 'markdown'],
        message: 'Invalid document type'
      }
    },
    visibility: {
      type: String,
      required: [true, 'Visibility setting is required'],
      enum: {
        values: ['private', 'team', 'public'],
        message: 'Invalid visibility setting'
      }
    },
    content: {
      type: String,
      default: ''
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Document owner is required']
    },
    team: {
      type: Schema.Types.ObjectId,
      ref: 'Team',
      required: [
        function(this: IDocument) {
          return this.visibility === 'team';
        },
        'Team is required for team visibility'
      ]
    },
    collaborators: [{
      type: Schema.Types.ObjectId,
      ref: 'User'
    }]
  },
  {
    timestamps: true
  }
);

// Add compound index for efficient searching
documentSchema.index({ title: 'text', description: 'text' });

// Add index for team-based queries
documentSchema.index({ team: 1, visibility: 1 });

// Add index for owner-based queries
documentSchema.index({ owner: 1 });

export const Document = models.Document || model<IDocument>('Document', documentSchema); 