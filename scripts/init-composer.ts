import { writeFileSync, mkdirSync } from 'fs';
import { execSync } from 'child_process';
import path from 'path';

// Create Composer directory structure
const COMPOSER_DIR = '.composer';
mkdirSync(COMPOSER_DIR, { recursive: true });

// Create Composer configuration
const composerConfig = {
  name: 'GAIAthon-Hub',
  version: '0.1.0',
  description: 'Earth Observation resources platform',
  rules: '.cursorrules',
  tasks: [
    {
      name: 'database-consolidation',
      path: 'src/lib/db',
      type: 'refactor'
    },
    {
      name: 'api-standardization',
      path: 'src/app/api',
      type: 'refactor'
    },
    {
      name: 'model-verification',
      path: 'src/lib/db/models',
      type: 'verify'
    }
  ],
  validation: {
    typescript: true,
    eslint: true,
    tests: true
  }
};

// Write Composer configuration
writeFileSync(
  path.join(COMPOSER_DIR, 'config.json'),
  JSON.stringify(composerConfig, null, 2)
);

// Create transition branch
execSync('git checkout -b feat/composer-transition');

console.log('Composer initialization complete!'); 