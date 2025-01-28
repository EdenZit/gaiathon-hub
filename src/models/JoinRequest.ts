import mongoose from 'mongoose';

const joinRequestSchema = new mongoose.Schema(
  {
    teamId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team',
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
  }
);

// Create compound index to prevent duplicate requests
joinRequestSchema.index({ teamId: 1, userId: 1 }, { unique: true });

// Create index for querying pending requests
joinRequestSchema.index({ teamId: 1, status: 1 });

export const JoinRequest = mongoose.models.JoinRequest || mongoose.model('JoinRequest', joinRequestSchema); 