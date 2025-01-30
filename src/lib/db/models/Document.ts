import { Schema, model, Types, Document as MongooseDocument } from 'mongoose';

interface IDocument extends MongooseDocument {
  title: string;
  description: string;
  type: 'text' | 'code' | 'markdown';
  visibility: 'private' | 'team' | 'public';
  content: string;
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
}

const documentSchema = new Schema<IDocument>({
  title: {
    type: String,
    required: [true, 'Document title is required'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Document description is required'],
  },
  type: {
    type: String,
    enum: ['text', 'code', 'markdown'],
    default: 'text',
  },
  visibility: {
    type: String,
    enum: ['private', 'team', 'public'],
    default: 'private',
  },
  content: {
    type: String,
    required: [true, 'Document content is required'],
  },
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  team: {
    type: Schema.Types.ObjectId,
    ref: 'Team',
  },
  collaborators: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
  }],
  version: {
    type: Number,
    default: 1,
  },
  lastModified: {
    type: Date,
    default: Date.now,
  },
  history: [{
    editor: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    changes: {
      type: String,
      required: true,
    },
  }],
}, {
  timestamps: true,
});

// Add indexes
documentSchema.index({ title: 1 });
documentSchema.index({ owner: 1 });
documentSchema.index({ team: 1 });
documentSchema.index({ collaborators: 1 });

// Add methods
documentSchema.methods.isCollaborator = function(userId: string): boolean {
  return this.collaborators.some((id: Types.ObjectId) => id.toString() === userId);
};

documentSchema.methods.canEdit = function(userId: string): boolean {
  return this.owner.toString() === userId || this.isCollaborator(userId);
};

export const Document = model<IDocument>('Document', documentSchema); 