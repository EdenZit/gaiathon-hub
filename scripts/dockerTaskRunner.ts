import { execSync } from 'child_process';

const runInDocker = (command: string) => {
  try {
    execSync(`docker-compose run --rm task-runner ${command}`, {
      stdio: 'inherit'
    });
  } catch (error) {
    console.error('Error running task in Docker:', error);
    process.exit(1);
  }
};

const taskName = process.argv[2];
if (!taskName) {
  console.error('Please specify a task name');
  process.exit(1);
}

runInDocker(`npm run task:${taskName}`); 