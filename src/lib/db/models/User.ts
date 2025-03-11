import { Schema, model, models, Document, Model } from 'mongoose';
import bcrypt from 'bcryptjs';
import { IUser } from '../../../types/models';

interface IUserDocument extends Omit<IUser, keyof Document>, Document {
  comparePassword(candidatePassword: string): Promise<boolean>;
  verifySecurityAnswer(answer: string): Promise<boolean>;
}

interface IUserModel extends Model<IUserDocument> {
  findByEmail(email: string): Promise<IUserDocument | null>;
}

const userSchema = new Schema<IUserDocument>(
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
    teamRole: {
      type: String,
      enum: ['leader', 'member'],
      default: 'member',
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active'
    },
    // Security question fields
    securityQuestion: {
      type: String,
      trim: true,
    },
    securityAnswer: {
      type: String,
      trim: true,
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other'],
    },
    lastActive: {
      type: Date,
    },
    teams: [{
      type: Schema.Types.ObjectId,
      ref: 'Team',
    }],
    institution: {
      type: String,
      trim: true,
    },
    yearOfStudy: {
      type: String,
      trim: true,
    },
    fieldOfStudy: {
      type: String,
      trim: true,
    },
    country: {
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
    previousHackathonExperience: {
      type: String,
      trim: true,
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
    profile: {
      avatar: String,
      bio: String,
      organization: String,
      position: String,
      skills: [String],
      socialLinks: {
        github: String,
        linkedin: String,
        twitter: String,
        website: String,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre('save', async function(this: IUserDocument, next) {
  if (!this.isModified('password')) return next();
  
  try {
    // Check if the password is already hashed
    if (this.password.startsWith('$2')) {
      return next();
    }
    
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(this.password, salt);
    this.password = hashedPassword;
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Hash security answer before saving
userSchema.pre('save', async function(this: IUserDocument, next) {
  if (!this.isModified('securityAnswer')) return next();
  
  try {
    // Only hash if there's a security answer
    if (this.securityAnswer) {
      // Check if the answer is already hashed
      if (this.securityAnswer.startsWith('$2')) {
        return next();
      }
      
      const salt = await bcrypt.genSalt(10);
      const hashedAnswer = await bcrypt.hash(this.securityAnswer.toLowerCase().trim(), salt);
      this.securityAnswer = hashedAnswer;
    }
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Add any instance methods here
userSchema.methods.toJSON = function(this: IUserDocument) {
  const obj = this.toObject();
  delete obj.password;
  delete obj.securityAnswer; // Don't expose security answer
  return obj;
};

// Add comparePassword method
userSchema.methods.comparePassword = async function(this: IUserDocument, candidatePassword: string): Promise<boolean> {
  try {
    if (!this.password || !candidatePassword) {
      console.error('DEBUG: Missing password for comparison');
      return false;
    }
    
    console.error('DEBUG: Comparing passwords');
    console.error('DEBUG: Candidate password length:', candidatePassword.length);
    console.error('DEBUG: Stored password hash length:', this.password.length);
    
    const isMatch = await bcrypt.compare(candidatePassword, this.password);
    console.error('DEBUG: Password comparison result:', isMatch);
    return isMatch;
  } catch (error) {
    console.error('Password comparison error:', error);
    return false;
  }
};

// Add verifySecurityAnswer method
userSchema.methods.verifySecurityAnswer = async function(this: IUserDocument, answer: string): Promise<boolean> {
  try {
    if (!this.securityAnswer || !answer) {
      return false;
    }
    
    // Compare the provided answer with the stored hash
    const isMatch = await bcrypt.compare(answer.toLowerCase().trim(), this.securityAnswer);
    return isMatch;
  } catch (error) {
    console.error('Security answer verification error:', error);
    return false;
  }
};

// Add any static methods here
userSchema.statics.findByEmail = function(email: string) {
  return this.findOne({ email: email.toLowerCase() });
};

export const User = (models.User || model<IUserDocument, IUserModel>('User', userSchema)) as IUserModel; 