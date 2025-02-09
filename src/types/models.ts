import { Document, Types } from 'mongoose';

// Base interface for all models
export interface BaseDocument extends Document {
  createdAt: Date;
  updatedAt: Date;
}

// User related types
export interface IUser extends BaseDocument {
  email: string;
  password: string;
  name: string;
  firstName?: string;
  lastName?: string;
  role: 'user' | 'admin';
  status: 'active' | 'inactive';
  teams: Types.ObjectId[];
  profile: {
    avatar?: string;
    bio?: string;
    organization?: string;
    position?: string;
    skills?: string[];
  };
}

// Team related types
export interface ITeam extends BaseDocument {
  name: string;
  description: string;
  leader: Types.ObjectId;
  members: ITeamMember[];
  projects: IProject[];
  documents: IDocument[];
  activity: IActivity[];
  chat: {
    messages: IChatMessage[];
  };
  calendar: {
    events: IEvent[];
  };
  progress: {
    tasks: ITask[];
    milestones: IMilestone[];
  };
}

export interface ITeamMember {
  user: Types.ObjectId;
  role: 'leader' | 'member' | 'contributor';
  joinedAt: Date;
  permissions: {
    canManageMembers: boolean;
    canManageDocuments: boolean;
    canManageProjects: boolean;
    canApproveProgress: boolean;
  };
}

export interface IProject {
  name: string;
  description: string;
  status: 'planning' | 'in-progress' | 'completed' | 'on-hold';
  startDate: Date;
  endDate?: Date;
  members: Types.ObjectId[];
  tasks: ITask[];
}

export interface IDocument {
  title: string;
  content: string;
  type: 'text' | 'code' | 'markdown';
  creator: Types.ObjectId;
  lastEditor: Types.ObjectId;
  version: number;
  history: {
    editor: Types.ObjectId;
    timestamp: Date;
    changes: string;
  }[];
}

export interface IActivity {
  type: 'member' | 'project' | 'document' | 'progress';
  action: string;
  user: Types.ObjectId;
  timestamp: Date;
  details: Record<string, any>;
}

export interface IChatMessage {
  sender: Types.ObjectId;
  content: string;
  timestamp: Date;
  attachments?: {
    type: string;
    url: string;
  }[];
  reactions?: {
    emoji: string;
    users: Types.ObjectId[];
  }[];
}

export interface IEvent {
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  location?: string;
  attendees: Types.ObjectId[];
  reminders?: {
    time: Date;
    type: 'email' | 'notification';
  }[];
}

export interface ITask {
  title: string;
  description?: string;
  status: 'todo' | 'in-progress' | 'review' | 'completed';
  assignee?: Types.ObjectId;
  dueDate?: Date;
  priority: 'low' | 'medium' | 'high';
  dependencies?: Types.ObjectId[];
}

export interface IMilestone {
  title: string;
  description: string;
  dueDate: Date;
  status: 'upcoming' | 'in-progress' | 'completed' | 'delayed';
  tasks: Types.ObjectId[];
  dependencies?: Types.ObjectId[];
} 