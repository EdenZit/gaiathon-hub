import mongoose from 'mongoose';

export interface ITeam extends mongoose.Document {
  name: string;
  leaderId: mongoose.Types.ObjectId;
  members: mongoose.Types.ObjectId[];
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

const teamSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Team name is required'],
    unique: true,
    trim: true,
  },
  leaderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Team leader is required'],
  },
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  description: {
    type: String,
    trim: true,
  },
}, {
  timestamps: true,
});

// Add indexes for better query performance
teamSchema.index({ name: 1 });
teamSchema.index({ leaderId: 1 });

export const Team = mongoose.models.Team || mongoose.model<ITeam>('Team', teamSchema); 