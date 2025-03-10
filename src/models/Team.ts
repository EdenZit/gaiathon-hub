import mongoose from 'mongoose';
import type { ITeamBase, TeamStatus, TeamCategory, TeamRole, ITeamMemberBase } from '@/types/common';

interface ITeamDocument extends Omit<ITeamBase, 'members'>, mongoose.Document {
  members: ITeamMemberBase[];
  isMember(userId: mongoose.Types.ObjectId): boolean;
  isLeader(userId: mongoose.Types.ObjectId): boolean;
  addMember(userId: mongoose.Types.ObjectId, role: TeamRole): Promise<void>;
}

const teamMemberSchema = new mongoose.Schema<ITeamMemberBase>({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  teamRole: {
    type: String,
    enum: ['leader', 'member'],
    required: true
  },
  joinedAt: {
    type: Date,
    default: Date.now
  }
});

const teamSchema = new mongoose.Schema<ITeamDocument>({
  name: {
    type: String,
    required: [true, 'Team name is required'],
    unique: true,
    trim: true
  },
  category: {
    type: String,
    enum: [
      'Digital Platforms and Interactive Applications',
      'IoT-Enabled Smart Systems',
      'Geospatial Intelligence and Policy Innovation'
    ],
    required: true
  },
  description: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  leaderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  members: [teamMemberSchema]
}, {
  timestamps: true
});

// Indexes for better query performance
teamSchema.index({ name: 1 });
teamSchema.index({ leaderId: 1 });
teamSchema.index({ 'members.userId': 1 });
teamSchema.index({ status: 1 });
teamSchema.index({ category: 1 });

// Pre-save middleware to ensure team has exactly one leader
teamSchema.pre('save', function(next) {
  const leaderCount = this.members.filter((member: ITeamMemberBase) => member.teamRole === 'leader').length;
  if (leaderCount !== 1) {
    next(new Error('Team must have exactly one leader'));
  }
  next();
});

// Method to check if a user is a member of the team
teamSchema.methods.isMember = function(userId: mongoose.Types.ObjectId): boolean {
  return this.members.some((member: ITeamMemberBase) => member.userId.equals(userId));
};

// Method to check if a user is the team leader
teamSchema.methods.isLeader = function(userId: mongoose.Types.ObjectId): boolean {
  return this.leaderId.equals(userId);
};

// Method to add a member to the team
teamSchema.methods.addMember = async function(userId: mongoose.Types.ObjectId, role: TeamRole): Promise<void> {
  if (this.isMember(userId)) {
    throw new Error('User is already a member of this team');
  }
  
  this.members.push({
    userId,
    teamRole: role,
    joinedAt: new Date()
  });
  
  await this.save();
};

// Method to remove a member from the team
teamSchema.methods.removeMember = async function(userId: mongoose.Types.ObjectId): Promise<void> {
  if (!this.isMember(userId)) {
    throw new Error('User is not a member of this team');
  }
  
  if (this.isLeader(userId)) {
    throw new Error('Cannot remove team leader');
  }
  
  this.members = this.members.filter(member => !member.userId.equals(userId));
  await this.save();
};

// Method to update member role
teamSchema.methods.updateMemberRole = async function(
  userId: mongoose.Types.ObjectId,
  newRole: TeamRole
): Promise<void> {
  if (!this.isMember(userId)) {
    throw new Error('User is not a member of this team');
  }
  
  const member: { userId: mongoose.Types.ObjectId; role: TeamRole } = this.members.find((m: { userId: mongoose.Types.ObjectId }) => m.userId.equals(userId));
  if (!member) {
    throw new Error('Member not found');
  }
  
  member.teamRole = newRole;
  await this.save();
};

export const Team = mongoose.models.Team || mongoose.model<ITeamDocument>('Team', teamSchema); 