import { Types } from 'mongoose';
import { IBaseEntity, IUserBase, UserRole } from './common';

export type TeamRole = 'leader' | 'member';

export interface IUser extends IUserBase, IBaseEntity {
  password: string;
  teams: Types.ObjectId[];
  hasActiveTeam: boolean;
}

// API Response Types
export interface UserResponse {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  institution?: string;
  fieldOfStudy?: string;
  yearOfStudy?: string;
  country?: string;
  gender?: 'male' | 'female' | null;
  profileCompleted: boolean;
  teams: string[];
  hasActiveTeam: boolean;
  createdAt: string;
  updatedAt: string;
}

// Request Types
export interface CreateUserRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface UpdateUserProfileRequest {
  institution?: string;
  fieldOfStudy?: string;
  yearOfStudy?: string;
  country?: string;
  gender?: 'male' | 'female' | null;
}

export interface UpdateUserRoleRequest {
  role: UserRole;
} 