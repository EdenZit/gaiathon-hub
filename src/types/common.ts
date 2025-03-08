import { Types } from 'mongoose';

export type UserRole = 'user' | 'admin' | 'leader';
export type TeamRole = 'leader' | 'member';
export type TeamStatus = 'pending' | 'approved' | 'rejected';
export type TeamCategory = 
  | 'Digital Platforms and Interactive Applications'
  | 'IoT-Enabled Smart Systems'
  | 'Geospatial Intelligence and Policy Innovation';

export interface IBaseEntity {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserBase {
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  institution?: string;
  department?: string;
  fieldOfStudy?: string;
  yearOfStudy?: string;
  country?: string;
  gender?: 'male' | 'female' | null;
  profileCompleted: boolean;
}

export interface ITeamMemberBase {
  userId: Types.ObjectId;
  teamRole: TeamRole;
  joinedAt: Date;
}

export interface ITeamBase {
  name: string;
  category: TeamCategory;
  description?: string;
  status: TeamStatus;
  leaderId: Types.ObjectId;
  members: ITeamMemberBase[];
} 