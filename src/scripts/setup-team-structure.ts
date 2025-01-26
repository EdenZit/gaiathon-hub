import fs from 'fs';
import path from 'path';

const REQUIRED_DIRECTORIES = [
  'src/app/teams',
  'src/app/teams/[teamId]',
  'src/app/teams/[teamId]/settings',
  'src/app/teams/[teamId]/members',
  'src/app/teams/[teamId]/projects',
  'src/app/teams/[teamId]/chat',
  'src/lib/services/team',
  'src/types/team',
];

function createDirectoryIfNotExists(dir: string) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`Created directory: ${dir}`);
  } else {
    console.log(`Directory already exists: ${dir}`);
  }
}

function setupNewStructure() {
  console.log('Setting up new team structure...');

  // Create required directories
  REQUIRED_DIRECTORIES.forEach(dir => {
    createDirectoryIfNotExists(dir);
  });

  console.log('\nNew team structure setup complete!');
  console.log('\nNext steps:');
  console.log('1. Add ENABLE_NEW_TEAM_STRUCTURE=false to your .env file');
  console.log('2. Gradually migrate components from /resources/team-workspace');
  console.log('3. Test both old and new paths work correctly');
  console.log('4. Enable the feature flag when ready to switch');
}

// Run the setup
setupNewStructure(); 