import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends mongoose.Document {
  email: string;
  password: string;
  fullName: string;
  firstName: string;
  lastName: string;
  institution: string;
  department?: string;
  location?: string;
  gaiaClubName: string;
  gaiaClubRole: string;
  teamJoiningPreference: 'invite' | 'request';
  contactInfo?: string;
  bio?: string;
  phoneNumber?: string;
  fieldOfStudy: string;
  yearOfStudy: string;
  country: string;
  previousHackathonExperience?: string;
  githubUrl?: string;
  personalWebsite?: string;
  linkedinUrl?: string;
  techSkills?: {
    coding: boolean;
    remoteSensing: boolean;
    gis: boolean;
    iot: boolean;
    other?: string;
  };
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
  firstName: {
    type: String,
    required: true,
    trim: true,
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
  },
  institution: {
    type: String,
    required: [true, 'Institution is required'],
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
  phoneNumber: {
    type: String,
    trim: true,
  },
  fieldOfStudy: {
    type: String,
    required: [true, 'Field of study is required'],
    trim: true,
  },
  yearOfStudy: {
    type: String,
    required: [true, 'Year of study is required'],
    trim: true,
  },
  country: {
    type: String,
    required: [true, 'Country is required'],
    trim: true,
  },
  previousHackathonExperience: {
    type: String,
    trim: true,
    required: false
  },
  githubUrl: {
    type: String,
    trim: true,
    required: false
  },
  personalWebsite: {
    type: String,
    trim: true,
    required: false
  },
  linkedinUrl: {
    type: String,
    trim: true,
    required: false
  },
  techSkills: {
    coding: {
      type: Boolean,
      default: false,
    },
    remoteSensing: {
      type: Boolean,
      default: false,
    },
    gis: {
      type: Boolean,
      default: false,
    },
    iot: {
      type: Boolean,
      default: false,
    },
    other: {
      type: String,
      trim: true,
    },
  },
  profileCompleted: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

// Split fullName into firstName and lastName before saving
userSchema.pre('save', function(next) {
  if (this.isModified('fullName')) {
    const nameParts = this.fullName.trim().split(/\s+/);
    this.firstName = nameParts[0];
    this.lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';
  }
  next();
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
    'gaiaClubName',
    'gaiaClubRole',
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
  if (typeof this.checkProfileCompletion === 'function') {
    this.profileCompleted = this.checkProfileCompletion();
  }
  next();
});

// Handle profileCompleted updates for findOneAndUpdate
userSchema.pre('findOneAndUpdate', function(next) {
  const update = this.getUpdate() as any;
  if (update?.$set) {
    const doc = update.$set;
    const requiredProfileFields = [
      'institution',
      'gaiaClubName',
      'gaiaClubRole',
      'fieldOfStudy',
      'yearOfStudy',
      'country'
    ];
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