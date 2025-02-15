import { Schema, model, Types, Document, Model } from 'mongoose';
import { ITeam, ITeamMember } from '../../../types/models';

interface ITeamDocument extends ITeam, Document {
  isMember: (userId: string) => boolean;
  isLeader: (userId: string) => boolean;
}

interface ITeamModel extends Model<ITeamDocument> {
  findByMember: (userId: string) => Promise<ITeamDocument[]>;
}

const teamMemberSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  role: {
    type: String,
    enum: ['leader', 'member', 'contributor'],
    required: true,
  },
  joinedAt: {
    type: Date,
    default: Date.now,
  },
  permissions: {
    canManageMembers: {
      type: Boolean,
      default: false,
    },
    canManageDocuments: {
      type: Boolean,
      default: false,
    },
    canManageProjects: {
      type: Boolean,
      default: false,
    },
    canApproveProgress: {
      type: Boolean,
      default: false,
    },
  },
});

const projectSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: String,
  status: {
    type: String,
    enum: ['planning', 'in-progress', 'completed', 'on-hold'],
    default: 'planning',
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: Date,
  members: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
  }],
  tasks: [{
    title: {
      type: String,
      required: true,
    },
    description: String,
    status: {
      type: String,
      enum: ['todo', 'in-progress', 'review', 'completed'],
      default: 'todo',
    },
    assignee: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    dueDate: Date,
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    dependencies: [{
      type: Schema.Types.ObjectId,
      ref: 'Task',
    }],
  }],
});

const documentSchema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  content: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['text', 'code', 'markdown'],
    default: 'text',
  },
  creator: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  lastEditor: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  version: {
    type: Number,
    default: 1,
  },
  history: [{
    editor: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    changes: String,
  }],
});

const teamSchema = new Schema<ITeamDocument>(
  {
    name: {
      type: String,
      required: [true, 'Team name is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Team description is required'],
    },
    leaderId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    members: [teamMemberSchema],
    projects: [projectSchema],
    documents: [documentSchema],
    activity: [{
      type: {
        type: String,
        enum: ['progress', 'member', 'project', 'document', 'message'],
        required: true,
      },
      action: {
        type: String,
        required: true,
      },
      user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
      timestamp: {
        type: Date,
        default: Date.now,
      },
      details: Schema.Types.Mixed,
    }],
    chat: {
      messages: [{
        type: Schema.Types.Mixed,
        default: [],
      }],
    },
    calendar: {
      events: [{
        type: Schema.Types.Mixed,
        default: [],
      }],
    },
    progress: {
      tasks: [{
        type: Schema.Types.Mixed,
        default: [],
      }],
      milestones: [{
        type: Schema.Types.Mixed,
        default: [],
      }],
    },
  },
  {
    timestamps: true,
  }
);

// Add indexes
teamSchema.index({ name: 1 });
teamSchema.index({ 'members.user': 1 });
teamSchema.index({ leaderId: 1 });

// Add instance methods
teamSchema.methods.isMember = function(userId: string): boolean {
  return this.members.some((member: ITeamMember) => 
    member.user.toString() === userId || this.leaderId.toString() === userId
  );
};

teamSchema.methods.isLeader = function(userId: string): boolean {
  return this.leaderId.toString() === userId;
};

// Add static methods
teamSchema.statics.findByMember = function(userId: string): Promise<ITeamDocument[]> {
  return this.find({ 
    $or: [
      { 'members.user': new Types.ObjectId(userId) },
      { leaderId: new Types.ObjectId(userId) }
    ]
  });
};

export const Team = model<ITeamDocument, ITeamModel>('Team', teamSchema); 