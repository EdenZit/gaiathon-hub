import { isFeatureEnabled } from './featureFlags';
import { TeamRole } from '@/types/team';

// Base paths
export const getTeamBasePath = (): string => {
  return isFeatureEnabled('enableNewTeamStructure')
    ? '/teams'
    : '/resources/team-workspace';
};

// Team workspace paths
export const getTeamPath = (teamId: string): string => {
  return `${getTeamBasePath()}/${teamId}`;
};

export const getTeamSettingsPath = (teamId: string): string => {
  return `${getTeamPath(teamId)}/settings`;
};

export const getTeamMembersPath = (teamId: string): string => {
  return `${getTeamPath(teamId)}/members`;
};

export const getTeamProjectsPath = (teamId: string): string => {
  return `${getTeamPath(teamId)}/projects`;
};

export const getTeamChatPath = (teamId: string): string => {
  return `${getTeamPath(teamId)}/chat`;
};

// API paths
export const getTeamApiBasePath = (): string => '/api/team';

export const getTeamApiPath = (teamId: string): string => {
  return `${getTeamApiBasePath()}/${teamId}`;
};

export const getTeamMembersApiPath = (teamId: string): string => {
  return `${getTeamApiPath(teamId)}/members`;
};

export const getTeamInviteApiPath = (teamId: string): string => {
  return `${getTeamApiPath(teamId)}/invite`;
};

// Resource paths
export const getTeamResourcePath = (teamId: string, resourceId: string): string => {
  return `${getTeamPath(teamId)}/resources/${resourceId}`;
};

export const getTeamResourcesApiPath = (teamId: string): string => {
  return `${getTeamApiPath(teamId)}/resources`;
};

// Invite paths
export const getTeamInvitePath = (teamId: string, inviteCode: string): string => {
  return `${getTeamPath(teamId)}/invite/${inviteCode}`;
};

// Role-based paths
export const getTeamRoleBasedPath = (teamId: string, role: TeamRole): string => {
  const basePath = getTeamPath(teamId);
  switch (role) {
    case TeamRole.OWNER:
    case TeamRole.ADMIN:
      return `${basePath}/admin`;
    case TeamRole.MEMBER:
      return basePath;
    case TeamRole.GUEST:
      return `${basePath}/guest`;
    default:
      return basePath;
  }
}; 