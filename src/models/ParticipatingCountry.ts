import mongoose from 'mongoose';

export interface IParticipatingCountry {
  name: string;
  universities: string[];
  isActive: boolean;
  registrationDate: Date;
}

const participatingCountrySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Country name is required'],
    unique: true,
    trim: true,
  },
  universities: [{
    type: String,
    required: [true, 'University name is required'],
    trim: true,
  }],
  isActive: {
    type: Boolean,
    default: true,
  },
  registrationDate: {
    type: Date,
    default: Date.now,
  }
}, {
  timestamps: true,
});

export const ParticipatingCountry = mongoose.models.ParticipatingCountry || 
  mongoose.model<IParticipatingCountry>('ParticipatingCountry', participatingCountrySchema); 