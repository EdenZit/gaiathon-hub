import { createContext, useContext, ReactNode } from 'react';
import { isFeatureEnabled } from '../utils/featureFlags';

interface MigrationContextType {
  isNewStructure: boolean;
  isTransitioning: boolean;
  canAccessOldPath: boolean;
  canAccessNewPath: boolean;
}

const MigrationContext = createContext<MigrationContextType>({
  isNewStructure: false,
  isTransitioning: false,
  canAccessOldPath: true,
  canAccessNewPath: false,
});

interface MigrationProviderProps {
  children: ReactNode;
}

export function MigrationProvider({ children }: MigrationProviderProps) {
  const isNewStructure = isFeatureEnabled('enableNewTeamStructure');
  
  // During transition period, we allow access to both old and new paths
  const isTransitioning = process.env.NEXT_PUBLIC_TEAM_MIGRATION_TRANSITION === 'true';
  
  const value = {
    isNewStructure,
    isTransitioning,
    canAccessOldPath: !isNewStructure || isTransitioning,
    canAccessNewPath: isNewStructure || isTransitioning,
  };

  return (
    <MigrationContext.Provider value={value}>
      {children}
    </MigrationContext.Provider>
  );
}

export const useMigration = () => {
  const context = useContext(MigrationContext);
  if (context === undefined) {
    throw new Error('useMigration must be used within a MigrationProvider');
  }
  return context;
}; 