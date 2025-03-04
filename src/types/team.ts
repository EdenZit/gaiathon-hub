import { Types } from 'mongoose';

export type TeamStatus = 'pending' | 'approved' | 'rejected';
export type TeamCategory = 
  | 'Digital Platforms and Interactive Applications'
  | 'IoT-Enabled Smart Systems'
  | 'Geospatial Intelligence and Policy Innovation';

export type TeamRole = 'leader' | 'member';

export interface ITeamMember {
  userId: Types.ObjectId;
  role: TeamRole;
  joinedAt: Date;
}

export interface ITeamBase {
  name: string;
  category: TeamCategory;
  description?: string;
  status: TeamStatus;
  leaderId: Types.ObjectId;
  members: ITeamMember[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ITeam extends ITeamBase {
  _id: Types.ObjectId;
}

// API Response Types
export interface TeamResponse {
  _id: string;
  name: string;
  category: TeamCategory;
  description?: string;
  status: TeamStatus;
  leader: TeamMemberResponse;
  members: TeamMemberResponse[];
  createdAt: string;
  updatedAt: string;
}

export interface TeamMemberResponse {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: TeamRole;
  institution?: string;
  country?: string;
  joinedAt: string;
}

// Request Types
export interface CreateTeamRequest {
  name: string;
  category: TeamCategory;
  description?: string;
}

export interface AddTeamMemberRequest {
  email: string;
  role?: TeamRole;
}

export interface UpdateTeamStatusRequest {
  status: TeamStatus;
} 