import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const MIGRATION_STEPS = [
  {
    name: 'Component Migration',
    oldPath: 'src/components/team-workspace',
    newPath: 'src/components/teams',
    subDirs: ['workspace', 'collaboration', 'documents', 'chat']
  },
  {
    name: 'API Route Migration',
    oldPath: 'src/app/api/resources/team-workspace',
    newPath: 'src/app/api/teams',
    subDirs: ['workspace', 'members', 'documents', 'chat']
  },
  {
    name: 'Page Migration',
    oldPath: 'src/app/resources/team-workspace',
    newPath: 'src/app/teams',
    subDirs: ['[teamId]', '[teamId]/workspace', '[teamId]/documents', '[teamId]/chat']
  }
];

function createDirectoryIfNotExists(dir: string) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`Created directory: ${dir}`);
  }
}

function backupDirectory(dir: string) {
  if (fs.existsSync(dir)) {
    const backupDir = `${dir}_backup_${Date.now()}`;
    fs.renameSync(dir, backupDir);
    console.log(`Created backup: ${backupDir}`);
    return backupDir;
  }
  return null;
}

async function migrateTeamStructure() {
  console.log('Starting team structure migration...');

  // Create backups
  const backups = MIGRATION_STEPS.map(step => ({
    ...step,
    backup: backupDirectory(step.oldPath)
  }));

  // Create new directory structure
  MIGRATION_STEPS.forEach(step => {
    createDirectoryIfNotExists(step.newPath);
    step.subDirs.forEach(subDir => {
      createDirectoryIfNotExists(path.join(step.newPath, subDir));
    });
  });

  // Move files with git if available
  try {
    backups.forEach(step => {
      if (step.backup) {
        execSync(`git mv ${step.backup}/* ${step.newPath}/`, { stdio: 'inherit' });
      }
    });
  } catch (error) {
    console.error('Error using git mv, falling back to regular move');
    // Fallback to regular move
    backups.forEach(step => {
      if (step.backup && fs.existsSync(step.backup)) {
        const files = fs.readdirSync(step.backup);
        files.forEach(file => {
          const oldPath = path.join(step.backup!, file);
          const newPath = path.join(step.newPath, file);
          fs.renameSync(oldPath, newPath);
        });
      }
    });
  }

  console.log('\nMigration complete!');
  console.log('\nNext steps:');
  console.log('1. Review the migrated files in the new structure');
  console.log('2. Update imports in your codebase');
  console.log('3. Test both old and new paths with feature flags');
  console.log('4. Remove backup directories after confirming everything works');
}

// Run migration
migrateTeamStructure().catch(console.error); 