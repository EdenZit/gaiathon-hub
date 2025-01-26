import { Schema, model, models } from 'mongoose';
import { hash } from 'bcryptjs';
import { IUser } from '@/types/models';

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters long'],
    },
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    firstName: {
      type: String,
      trim: true,
    },
    lastName: {
      type: String,
      trim: true,
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    teams: [{
      type: Schema.Types.ObjectId,
      ref: 'Team',
    }],
    profile: {
      avatar: String,
      bio: String,
      organization: String,
      position: String,
      skills: [String],
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  
  try {
    this.password = await hash(this.password, 12);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Add any instance methods here
userSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

// Add any static methods here
userSchema.statics.findByEmail = function(email: string) {
  return this.findOne({ email: email.toLowerCase() });
};

export const User = models.User || model<IUser>('User', userSchema); 