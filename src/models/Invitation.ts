import mongoose from 'mongoose';
import crypto from 'crypto';

export interface IInvitation extends mongoose.Document {
  email: string;
  teamId: mongoose.Types.ObjectId;
  invitedBy: mongoose.Types.ObjectId;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  role: 'member' | 'contributor';
  token: string;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const invitationSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true,
    trim: true,
  },
  teamId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    required: [true, 'Team ID is required'],
  },
  invitedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Inviter ID is required'],
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'declined', 'expired'],
    default: 'pending',
  },
  role: {
    type: String,
    enum: ['member', 'contributor'],
    default: 'member',
  },
  token: {
    type: String,
    required: true,
    unique: true,
  },
  expiresAt: {
    type: Date,
    required: true,
    default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
  }
}, {
  timestamps: true,
});

// Create compound index to prevent duplicate invitations
invitationSchema.index({ email: 1, teamId: 1, status: 1 });

// Generate invitation token before saving
invitationSchema.pre('save', function(next) {
  if (this.isNew) {
    this.token = crypto.randomBytes(32).toString('hex');
  }
  next();
});

// Add static method to find valid invitation by token
invitationSchema.statics.findValidInvitation = async function(token: string) {
  return this.findOne({
    token,
    status: 'pending',
    expiresAt: { $gt: new Date() }
  });
};

// Add method to check if invitation is expired
invitationSchema.methods.isExpired = function(): boolean {
  return this.expiresAt < new Date();
};

export const Invitation = mongoose.models.Invitation || mongoose.model<IInvitation>('Invitation', invitationSchema); 