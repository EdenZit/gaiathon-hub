import { Schema, model, Types } from 'mongoose';

interface IMessage {
  content: string;
  sender: Types.ObjectId;
  team: Types.ObjectId;
  timestamp: Date;
  type: 'text' | 'file' | 'system';
  metadata?: {
    fileName?: string;
    fileSize?: number;
    fileType?: string;
    fileUrl?: string;
  };
}

const messageSchema = new Schema<IMessage>(
  {
    content: {
      type: String,
      required: true,
    },
    sender: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    team: {
      type: Schema.Types.ObjectId,
      ref: 'Team',
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    type: {
      type: String,
      enum: ['text', 'file', 'system'],
      default: 'text',
    },
    metadata: {
      fileName: String,
      fileSize: Number,
      fileType: String,
      fileUrl: String,
    },
  },
  {
    timestamps: true,
  }
);

// Add indexes
messageSchema.index({ team: 1, timestamp: -1 });
messageSchema.index({ sender: 1 });

export const Message = model<IMessage>('Message', messageSchema); 