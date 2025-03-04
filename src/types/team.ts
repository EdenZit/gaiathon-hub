import { Types } from 'mongoose';
import { IBaseEntity, ITeamBase, ITeamMemberBase, TeamCategory, TeamRole, TeamStatus } from './common';

export interface ITeamMember extends ITeamMemberBase {
  user: {
    _id: Types.ObjectId;
    firstName: string;
    lastName: string;
    email: string;
    institution?: string;
    country?: string;
  };
}

export interface ITeam extends ITeamBase, IBaseEntity {}

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
  teamRole: TeamRole;
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
  teamRole?: TeamRole;
}

export interface UpdateTeamStatusRequest {
  status: TeamStatus;
} 