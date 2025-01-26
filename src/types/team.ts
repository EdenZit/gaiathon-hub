export interface TeamMember {
  id: string;
  userId: string;
  teamId: string;
  role: TeamRole;
  joinedAt: Date;
  status: MembershipStatus;
}

export enum TeamRole {
  OWNER = 'OWNER',
  ADMIN = 'ADMIN',
  MEMBER = 'MEMBER',
  GUEST = 'GUEST'
}

export enum MembershipStatus {
  ACTIVE = 'ACTIVE',
  PENDING = 'PENDING',
  INACTIVE = 'INACTIVE'
}

export interface Team {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
  ownerId: string;
  settings: TeamSettings;
  visibility: TeamVisibility;
}

export interface TeamSettings {
  allowGuestInvites: boolean;
  requireAdminApproval: boolean;
  defaultMemberRole: TeamRole;
  features: EnabledTeamFeatures;
}

export interface EnabledTeamFeatures {
  chat: boolean;
  projects: boolean;
  resources: boolean;
  timeline: boolean;
}

export enum TeamVisibility {
  PUBLIC = 'PUBLIC',
  PRIVATE = 'PRIVATE',
  ORGANIZATION = 'ORGANIZATION'
}

export interface TeamInvite {
  id: string;
  teamId: string;
  inviterId: string;
  email: string;
  role: TeamRole;
  status: InviteStatus;
  expiresAt: Date;
  createdAt: Date;
}

export enum InviteStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  EXPIRED = 'EXPIRED'
} 