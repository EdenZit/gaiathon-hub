import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends mongoose.Document {
  email: string;
  password: string;
  fullName: string;
  institution?: string;
  department?: string;
  location?: string;
  gaiaClubName?: string;
  gaiaClubRole?: string;
  teamJoiningPreference?: 'invite' | 'request';
  contactInfo?: string;
  bio?: string;
  profileCompleted: boolean;
  comparePassword(candidatePassword: string): Promise<boolean>;
  checkProfileCompletion(): boolean;
}

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters long'],
  },
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true,
  },
  institution: {
    type: String,
    trim: true,
  },
  department: {
    type: String,
    trim: true,
  },
  location: {
    type: String,
    trim: true,
  },
  gaiaClubName: {
    type: String,
    trim: true,
  },
  gaiaClubRole: {
    type: String,
    trim: true,
  },
  teamJoiningPreference: {
    type: String,
    enum: ['invite', 'request'],
    default: 'invite',
  },
  contactInfo: {
    type: String,
    trim: true,
  },
  bio: {
    type: String,
    trim: true,
  },
  profileCompleted: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    return false;
  }
};

// Method to check profile completion
userSchema.methods.checkProfileCompletion = function(): boolean {
  const requiredProfileFields = ['institution', 'gaiaClubName', 'gaiaClubRole'];
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

// Handle profileCompleted updates for findOneAndUpdate
userSchema.pre('findOneAndUpdate', function(next) {
  const update = this.getUpdate() as any;
  if (update?.$set) {
    const doc = update.$set;
    const requiredProfileFields = ['institution', 'gaiaClubName', 'gaiaClubRole'];
    const isProfileComplete = requiredProfileFields.every(field => {
      const value = doc[field];
      return value && value.trim().length > 0;
    });
    update.$set.profileCompleted = isProfileComplete;
  }
  next();
});

// Ensure mongoose.models.User exists before creating a new model
export const User = mongoose.models.User || mongoose.model<IUser>('User', userSchema); 