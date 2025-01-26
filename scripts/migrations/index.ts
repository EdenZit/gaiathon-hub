import { fixStructure } from './fixStructuralConflicts';
import { migrateTeamData } from './migrateTeamData';
import { validateMigrations } from './validateMigrations';

type MigrationName = 'fixStructure' | 'migrateTeamData' | 'validate';

interface MigrationMap {
  fixStructure: typeof fixStructure;
  migrateTeamData: typeof migrateTeamData;
  validate: typeof validateMigrations;
}

export const migrations: MigrationMap = {
  fixStructure,
  migrateTeamData,
  validate: validateMigrations,
};

async function runMigration(migrationName: MigrationName) {
  console.log(`Running migration: ${migrationName}`);
  try {
    await migrations[migrationName]();
    
    // Run validation after each migration unless we're already running validation
    if (migrationName !== 'validate') {
      console.log('\nValidating migration...');
      await migrations.validate();
    }
    
    console.log(`\nMigration ${migrationName} completed successfully!`);
  } catch (error) {
    console.error(`Migration ${migrationName} failed:`, error);
    process.exit(1);
  }
}

if (require.main === module) {
  const migrationName = process.argv[2] as MigrationName;
  if (!migrationName || !migrations[migrationName]) {
    console.error('Please specify a valid migration name:');
    console.error('Available migrations:', Object.keys(migrations).join(', '));
    process.exit(1);
  }
  
  runMigration(migrationName).catch(console.error);
} 