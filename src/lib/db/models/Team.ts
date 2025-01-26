import { Schema, model, models } from 'mongoose';
import { ITeam } from '@/types/models';

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

const teamSchema = new Schema<ITeam>(
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
    leader: {
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
        enum: ['member', 'project', 'document', 'progress'],
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
        sender: {
          type: Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        content: {
          type: String,
          required: true,
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
        attachments: [{
          type: String,
          url: String,
        }],
        reactions: [{
          emoji: String,
          users: [{
            type: Schema.Types.ObjectId,
            ref: 'User',
          }],
        }],
      }],
    },
    calendar: {
      events: [{
        title: {
          type: String,
          required: true,
        },
        description: String,
        startTime: {
          type: Date,
          required: true,
        },
        endTime: {
          type: Date,
          required: true,
        },
        location: String,
        attendees: [{
          type: Schema.Types.ObjectId,
          ref: 'User',
        }],
        reminders: [{
          time: Date,
          type: {
            type: String,
            enum: ['email', 'notification'],
          },
        }],
      }],
    },
    progress: {
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
      milestones: [{
        title: {
          type: String,
          required: true,
        },
        description: {
          type: String,
          required: true,
        },
        dueDate: {
          type: Date,
          required: true,
        },
        status: {
          type: String,
          enum: ['upcoming', 'in-progress', 'completed', 'delayed'],
          default: 'upcoming',
        },
        tasks: [{
          type: Schema.Types.ObjectId,
          ref: 'Task',
        }],
        dependencies: [{
          type: Schema.Types.ObjectId,
          ref: 'Milestone',
        }],
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
teamSchema.index({ leader: 1 });

// Add instance methods
teamSchema.methods.isMember = function(userId: string) {
  return this.members.some((member: any) => member.user.toString() === userId);
};

teamSchema.methods.isLeader = function(userId: string) {
  return this.leader.toString() === userId;
};

// Add static methods
teamSchema.statics.findByMember = function(userId: string) {
  return this.find({ 'members.user': userId });
};

export const Team = models.Team || model<ITeam>('Team', teamSchema); 