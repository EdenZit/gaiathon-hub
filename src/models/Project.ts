import mongoose, { Schema, Document } from 'mongoose';

export interface IProject extends Document {
  name: string;
  description: string;
  team: mongoose.Types.ObjectId;
  startDate: Date;
  endDate: Date;
  status: 'planning' | 'in-progress' | 'completed' | 'on-hold';
  milestones: {
    title: string;
    description: string;
    dueDate: Date;
    status: 'pending' | 'in-progress' | 'completed';
    assignedTo: mongoose.Types.ObjectId[];
  }[];
  progress: number;
  createdBy: mongoose.Types.ObjectId;
  updatedAt: Date;
  createdAt: Date;
}

const ProjectSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Project name is required'],
    trim: true,
    maxlength: [100, 'Project name cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Project description is required'],
    maxlength: [500, 'Project description cannot be more than 500 characters']
  },
  team: {
    type: Schema.Types.ObjectId,
    ref: 'Team',
    required: [true, 'Team is required']
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required']
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required']
  },
  status: {
    type: String,
    enum: ['planning', 'in-progress', 'completed', 'on-hold'],
    default: 'planning'
  },
  milestones: [{
    title: {
      type: String,
      required: true
    },
    description: String,
    dueDate: {
      type: Date,
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'in-progress', 'completed'],
      default: 'pending'
    },
    assignedTo: [{
      type: Schema.Types.ObjectId,
      ref: 'User'
    }]
  }],
  progress: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Index for better query performance
ProjectSchema.index({ team: 1, status: 1 });
ProjectSchema.index({ startDate: 1, endDate: 1 });

export const Project = mongoose.models.Project || mongoose.model<IProject>('Project', ProjectSchema);
export default Project; 