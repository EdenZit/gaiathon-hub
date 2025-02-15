import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends mongoose.Document {
  email: string;
  password: string;
  name: string;
  firstName?: string;
  lastName?: string;
  role: 'user' | 'admin';
  teamRole: 'leader' | 'member';
  teams?: mongoose.Types.ObjectId[];
  profileCompleted: boolean;
  institution?: string;
  fieldOfStudy?: string;
  yearOfStudy?: string;
  country?: string;
  gender?: 'male' | 'female';
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
    minlength: [8, 'Password must be at least 8 characters'],
  },
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
  },
  firstName: String,
  lastName: String,
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
  teamRole: {
    type: String,
    enum: ['leader', 'member'],
    default: 'member',
    required: true,
  },
  teams: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
  }],
  profileCompleted: {
    type: Boolean,
    default: false,
  },
  institution: String,
  fieldOfStudy: String,
  yearOfStudy: String,
  country: String,
  gender: {
    type: String,
    enum: ['male', 'female'],
  },
}, {
  timestamps: true,
});

// Split fullName into firstName and lastName before saving
userSchema.pre('save', function(next) {
  if (this.isModified('name')) {
    const nameParts = this.name.trim().split(/\s+/);
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

// Handle profileCompleted updates for findOneAndUpdate
userSchema.pre('findOneAndUpdate', function(next) {
  const update = this.getUpdate() as any;
  if (update?.$set) {
    const doc = update.$set;
    const requiredProfileFields = [
      'institution',
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