import { Schema, model, models, Types } from 'mongoose';

export interface IDocument {
  name: string;
  type: string;
  size: number;
  teamId: Types.ObjectId;
  uploadedBy: Types.ObjectId;
  title: string;
  description: string;
  content: string;
  visibility: 'private' | 'team' | 'public';
  owner: Types.ObjectId;
  team?: Types.ObjectId;
  collaborators: Types.ObjectId[];
  version: number;
  lastModified: Date;
  history: {
    editor: Types.ObjectId;
    timestamp: Date;
    changes: string;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const documentSchema = new Schema<IDocument>(
  {
    name: {
      type: String,
      required: [true, 'File name is required'],
      trim: true
    },
    type: {
      type: String,
      required: [true, 'File type is required']
    },
    size: {
      type: Number,
      required: [true, 'File size is required']
    },
    teamId: {
      type: Schema.Types.ObjectId,
      ref: 'Team',
      required: [true, 'Team ID is required']
    },
    uploadedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Uploader is required']
    },
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
    content: {
      type: String,
      default: ''
    },
    visibility: {
      type: String,
      required: [true, 'Visibility setting is required'],
      enum: {
        values: ['private', 'team', 'public'],
        message: 'Invalid visibility setting'
      },
      default: 'private'
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
    }],
    version: {
      type: Number,
      default: 1
    },
    lastModified: {
      type: Date,
      default: Date.now
    },
    history: [{
      editor: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      timestamp: {
        type: Date,
        default: Date.now
      },
      changes: {
        type: String,
        required: true
      }
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
documentSchema.index({ teamId: 1 });

// Add index for owner-based queries
documentSchema.index({ owner: 1 });
documentSchema.index({ uploadedBy: 1 });

// Add methods
documentSchema.methods.isCollaborator = function(userId: string): boolean {
  return this.collaborators.some((id: Types.ObjectId) => id.toString() === userId);
};

documentSchema.methods.canEdit = function(userId: string): boolean {
  return this.owner.toString() === userId || this.isCollaborator(userId);
};

export const Document = models.Document || model<IDocument>('Document', documentSchema); 