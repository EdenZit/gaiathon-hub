import mongoose from 'mongoose';

export interface IDocument extends mongoose.Document {
  title: string;
  content: string;
  format: 'text' | 'pdf' | 'doc' | 'sheet';
  createdBy: mongoose.Types.ObjectId;
  team: mongoose.Types.ObjectId;
  lastModified: Date;
  version: number;
  versions: {
    content: string;
    modifiedBy: mongoose.Types.ObjectId;
    modifiedAt: Date;
    version: number;
  }[];
  comments: {
    content: string;
    author: mongoose.Types.ObjectId;
    createdAt: Date;
    resolved: boolean;
  }[];
  sharedWith: {
    user: mongoose.Types.ObjectId;
    role: 'viewer' | 'editor' | 'owner';
  }[];
  googleDriveId?: string;
  isEncrypted: boolean;
}

const documentSchema = new mongoose.Schema<IDocument>({
  title: { type: String, required: true },
  content: { type: String, required: true },
  format: { 
    type: String, 
    required: true, 
    enum: ['text', 'pdf', 'doc', 'sheet'] 
  },
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  team: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Team', 
    required: true 
  },
  lastModified: { type: Date, default: Date.now },
  version: { type: Number, default: 1 },
  versions: [{
    content: String,
    modifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    modifiedAt: Date,
    version: Number
  }],
  comments: [{
    content: String,
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdAt: { type: Date, default: Date.now },
    resolved: { type: Boolean, default: false }
  }],
  sharedWith: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    role: { 
      type: String, 
      enum: ['viewer', 'editor', 'owner'],
      default: 'viewer'
    }
  }],
  googleDriveId: String,
  isEncrypted: { type: Boolean, default: false }
}, {
  timestamps: true
});

export const Document = mongoose.models.Document || mongoose.model<IDocument>('Document', documentSchema); 