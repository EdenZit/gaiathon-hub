import mongoose, { Document } from 'mongoose';
import bcrypt from 'bcryptjs';
import { IUserBase, UserRole } from '@/types/user';

interface IUserDocument extends Omit<IUserBase, '_id'>, Document {
  comparePassword(candidatePassword: string): Promise<boolean>;
  checkProfileCompletion(): boolean;
  isTeamLeader(): Promise<boolean>;
  getActiveTeam(): Promise<any>;
  leaveTeam(teamId: mongoose.Types.ObjectId): Promise<void>;
}

const userSchema = new mongoose.Schema<IUserDocument>({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters']
  },
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'team_leader'],
    default: 'user'
  },
  teams: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team'
  }],
  hasActiveTeam: {
    type: Boolean,
    default: false
  },
  profileCompleted: {
    type: Boolean,
    default: false
  },
  institution: String,
  fieldOfStudy: String,
  yearOfStudy: String,
  country: String,
  gender: {
    type: String,
    enum: ['male', 'female', null],
    default: null
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Add comparePassword method
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    console.error('Password comparison error:', error);
    return false;
  }
};

// Method to check profile completion
userSchema.methods.checkProfileCompletion = function(): boolean {
  const requiredProfileFields = [
    'institution',
    'fieldOfStudy',
    'yearOfStudy',
    'country'
  ];
  return requiredProfileFields.every(field => {
    const value = this.get(field);
    return value && value.trim().length > 0;
  });
};

// Update profileCompleted status before saving
userSchema.pre('save', function(next) {
  this.profileCompleted = this.checkProfileCompletion();
  next();
});

// Method to check if user is a team leader
userSchema.methods.isTeamLeader = async function(): Promise<boolean> {
  return this.role === 'team_leader';
};

// Method to check if user can create a team
userSchema.methods.canCreateTeam = async function(): Promise<boolean> {
  // Must be a team leader and have completed profile
  if (this.role !== 'team_leader' || !this.profileCompleted) {
    return false;
  }

  // Check if user already has an active team
  const existingTeam = await mongoose.model('Team').findOne({
    leaderId: this._id,
    status: { $ne: 'rejected' }
  });

  return !existingTeam;
};

// Method to get user's active team
userSchema.methods.getActiveTeam = async function() {
  if (!this.hasActiveTeam) return null;
  
  const team = await mongoose.model('Team').findOne({
    members: {
      $elemMatch: {
        userId: this._id,
        role: 'leader'
      }
    },
    status: 'approved'
  }).populate('members.userId', 'firstName lastName email institution country');
  
  return team;
};

// Method to check if user is already a team leader
userSchema.methods.isAlreadyTeamLeader = async function(): Promise<boolean> {
  const existingTeam = await mongoose.model('Team').findOne({
    leaderId: this._id,
    status: { $ne: 'rejected' }
  });
  return !!existingTeam;
};

// Method to leave a team
userSchema.methods.leaveTeam = async function(teamId: mongoose.Types.ObjectId): Promise<void> {
  const team = await mongoose.model('Team').findOne({
    _id: teamId,
    'members.userId': this._id
  });
  
  if (!team) {
    throw new Error('User is not a member of this team');
  }
  
  if (team.leaderId.equals(this._id)) {
    throw new Error('Team leader cannot leave the team');
  }
  
  this.teams = this.teams.filter(id => !id.equals(teamId));
  await this.save();
};

export const User = mongoose.models.User || mongoose.model<IUserDocument>('User', userSchema); 