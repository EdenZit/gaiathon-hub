import { execSync } from 'child_process';

const verificationSteps = [
  'composer verify database-consolidation',
  'composer verify api-standardization',
  'composer verify model-verification',
  'npm run test',
  'npm run lint'
];

async function runVerification() {
  for (const step of verificationSteps) {
    try {
      console.log(`Running: ${step}`);
      execSync(step, { stdio: 'inherit' });
    } catch (error) {
      console.error(`Error in step: ${step}`);
      process.exit(1);
    }
  }
}

runVerification(); 