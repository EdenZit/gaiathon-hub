import { Document, Types } from 'mongoose';

// Base interface for all models
export interface BaseDocument extends Omit<Document, '_id'> {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// User related types
export interface IUser {
  _id: string;
  email: string;
  password: string;
  name: string;
  firstName?: string;
  lastName?: string;
  role: 'user' | 'admin';
  teamRole: 'leader' | 'member';
  status: 'active' | 'inactive';
  gender?: 'male' | 'female' | 'other';
  emailVerified?: boolean;
  lastActive?: Date;
  teams?: string[];
  institution?: string;
  yearOfStudy?: string;
  fieldOfStudy?: string;
  country?: string;
  department?: string;
  location?: string;
  contactInfo?: string;
  bio?: string;
  phoneNumber?: string;
  previousHackathonExperience?: string;
  githubUrl?: string;
  personalWebsite?: string;
  linkedinUrl?: string;
  techSkills?: {
    coding: boolean;
    remoteSensing: boolean;
    gis: boolean;
    iot: boolean;
    other?: string;
  };
  profileCompleted?: boolean;
  profile?: {
    avatar?: string;
    bio?: string;
    organization?: string;
    position?: string;
    skills?: string[];
    socialLinks?: {
      github?: string;
      linkedin?: string;
      twitter?: string;
      website?: string;
      [key: string]: string | undefined;
    };
  };
  createdAt: Date;
  updatedAt: Date;
}

// Team related types
export interface ITeam {
  name: string;
  description: string;
  leaderId: Types.ObjectId;
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
  contactInfo?: {
    email: string;
    phone: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export type ITeamDocument = Document & ITeam & {
  isMember: (userId: string) => boolean;
  isLeader: (userId: string) => boolean;
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