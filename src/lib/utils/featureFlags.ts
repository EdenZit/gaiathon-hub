import { ComponentType, ReactElement, createElement } from 'react';

interface FeatureFlags {
  enableNewTeamStructure: boolean;
  // Add more feature flags as needed
}

const getFeatureFlags = (): FeatureFlags => {
  return {
    enableNewTeamStructure: process.env.ENABLE_NEW_TEAM_STRUCTURE === 'true',
  };
};

export const isFeatureEnabled = (flagName: keyof FeatureFlags): boolean => {
  const flags = getFeatureFlags();
  return flags[flagName] || false;
};

export const withFeatureFlag = <P extends object>(
  flagName: keyof FeatureFlags,
  Component: ComponentType<P>
): ComponentType<P> => {
  return function FeatureFlaggedComponent(props: P): ReactElement | null {
    const isEnabled = isFeatureEnabled(flagName);
    return isEnabled ? createElement(Component, props) : null;
  };
}; 