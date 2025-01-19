import mongoose from 'mongoose';

export interface ITeam extends mongoose.Document {
  name: string;
  description: string;
  leader: mongoose.Types.ObjectId;
  members: {
    user: mongoose.Types.ObjectId;
    role: 'leader' | 'member';
    joinedAt: Date;
    permissions: {
      canManageMembers: boolean;
      canManageDocuments: boolean;
      canManageProjects: boolean;
      canApproveProgress: boolean;
    };
  }[];
  projects: mongoose.Types.ObjectId[];
  documents: mongoose.Types.ObjectId[];
  chat: {
    messages: {
      content: string;
      author: mongoose.Types.ObjectId;
      createdAt: Date;
      attachments: string[];
      reactions: {
        emoji: string;
        users: mongoose.Types.ObjectId[];
      }[];
      isPinned: boolean;
      thread?: mongoose.Types.ObjectId;
    }[];
  };
  calendar: {
    events: {
      title: string;
      description: string;
      startDate: Date;
      endDate: Date;
      createdBy: mongoose.Types.ObjectId;
      attendees: mongoose.Types.ObjectId[];
      reminders: {
        type: 'email' | 'notification';
        time: number; // minutes before event
      }[];
    }[];
  };
  progress: {
    tasks: {
      title: string;
      description: string;
      assignedTo: mongoose.Types.ObjectId[];
      status: 'pending' | 'in-progress' | 'review' | 'completed';
      dueDate: Date;
      completedAt?: Date;
      approvedBy?: mongoose.Types.ObjectId;
    }[];
    milestones: {
      title: string;
      description: string;
      dueDate: Date;
      completedAt?: Date;
      tasks: mongoose.Types.ObjectId[];
    }[];
  };
  activity: {
    type: 'document' | 'member' | 'task' | 'milestone' | 'chat' | 'calendar';
    action: string;
    user: mongoose.Types.ObjectId;
    timestamp: Date;
    details: Record<string, any>;
  }[];
}

const teamSchema = new mongoose.Schema<ITeam>({
  name: { type: String, required: true },
  description: { type: String, required: true },
  leader: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  members: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    role: { 
      type: String, 
      enum: ['leader', 'member'],
      default: 'member'
    },
    joinedAt: { type: Date, default: Date.now },
    permissions: {
      canManageMembers: { type: Boolean, default: false },
      canManageDocuments: { type: Boolean, default: false },
      canManageProjects: { type: Boolean, default: false },
      canApproveProgress: { type: Boolean, default: false }
    }
  }],
  projects: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Project' 
  }],
  documents: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Document' 
  }],
  chat: {
    messages: [{
      content: { type: String, required: true },
      author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      createdAt: { type: Date, default: Date.now },
      attachments: [String],
      reactions: [{
        emoji: String,
        users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
      }],
      isPinned: { type: Boolean, default: false },
      thread: { type: mongoose.Schema.Types.ObjectId, ref: 'Message' }
    }]
  },
  calendar: {
    events: [{
      title: { type: String, required: true },
      description: String,
      startDate: { type: Date, required: true },
      endDate: { type: Date, required: true },
      createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      attendees: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
      reminders: [{
        type: { type: String, enum: ['email', 'notification'] },
        time: Number
      }]
    }]
  },
  progress: {
    tasks: [{
      title: { type: String, required: true },
      description: String,
      assignedTo: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
      status: { 
        type: String, 
        enum: ['pending', 'in-progress', 'review', 'completed'],
        default: 'pending'
      },
      dueDate: Date,
      completedAt: Date,
      approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
    }],
    milestones: [{
      title: { type: String, required: true },
      description: String,
      dueDate: Date,
      completedAt: Date,
      tasks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Task' }]
    }]
  },
  activity: [{
    type: { 
      type: String, 
      enum: ['document', 'member', 'task', 'milestone', 'chat', 'calendar'],
      required: true 
    },
    action: { type: String, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    timestamp: { type: Date, default: Date.now },
    details: { type: mongoose.Schema.Types.Mixed }
  }]
}, {
  timestamps: true
});

// Index for activity feed queries
teamSchema.index({ 'activity.timestamp': -1 });

// Index for chat message searches
teamSchema.index({ 'chat.messages.content': 'text' });

export const Team = mongoose.models.Team || mongoose.model<ITeam>('Team', teamSchema); 