import { isFeatureEnabled } from './featureFlags';

// Base paths
export const getBasePath = (): string => {
  return '/resources';
};

// Resource paths
export const getResourcePath = (resourceId: string): string => {
  return `${getBasePath()}/resources/${resourceId}`;
};

export const getResourcesApiPath = (): string => {
  return '/api/resources';
}; 