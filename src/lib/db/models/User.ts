import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends mongoose.Document {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  institution: string;
  department: string;
  fieldOfStudy: string;
  yearOfStudy: string;
  phoneNumber: string;
  country: string;
  // Hackathon-specific information
  techSkills: {
    coding: boolean;
    remoteSensing: boolean;
    gis: boolean;
    iot: boolean;
    other?: string;
  };
  previousHackathonExperience: string;
  githubUrl?: string;
  personalWebsite?: string;
  linkedinUrl?: string;
  createdAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new mongoose.Schema<IUser>({
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
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
  },
  institution: {
    type: String,
    trim: true,
    default: '',
  },
  department: {
    type: String,
    trim: true,
    default: '',
  },
  fieldOfStudy: {
    type: String,
    trim: true,
    default: '',
  },
  yearOfStudy: {
    type: String,
    trim: true,
    default: '',
  },
  phoneNumber: {
    type: String,
    trim: true,
    default: '',
  },
  country: {
    type: String,
    trim: true,
    default: '',
  },
  // Hackathon-specific information
  techSkills: {
    coding: { type: Boolean, default: false },
    remoteSensing: { type: Boolean, default: false },
    gis: { type: Boolean, default: false },
    iot: { type: Boolean, default: false },
    other: { type: String, trim: true },
  },
  previousHackathonExperience: {
    type: String,
    trim: true,
    default: '',
  },
  githubUrl: {
    type: String,
    trim: true,
  },
  personalWebsite: {
    type: String,
    trim: true,
  },
  linkedinUrl: {
    type: String,
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    if (error instanceof Error) {
      next(error);
    } else {
      next(new Error('An error occurred while hashing the password'));
    }
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export const User = mongoose.models.User || mongoose.model<IUser>('User', userSchema); 