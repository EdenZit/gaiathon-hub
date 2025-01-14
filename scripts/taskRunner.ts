import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'yaml';

// Type definitions
interface StepConfig {
  name: string;
  files: string[];
  rules: string[];
}

interface TaskConfig {
  steps: StepConfig[];
}

interface TasksConfig {
  [key: string]: TaskConfig;
}

class TaskRunner {
  private tasksConfig: TasksConfig;
  private readonly configPath: string;

  constructor() {
    this.configPath = path.join(process.cwd(), '.composer', 'tasks.yaml');
    this.tasksConfig = this.loadConfig();
  }

  private loadConfig(): TasksConfig {
    try {
      if (!fs.existsSync(this.configPath)) {
        throw new Error(`Tasks configuration not found at ${this.configPath}`);
      }
      const tasksFile = fs.readFileSync(this.configPath, 'utf8');
      return yaml.parse(tasksFile);
    } catch (error) {
      console.error('Error loading tasks configuration:', error);
      process.exit(1);
    }
  }

  private async executeCommand(command: string): Promise<void> {
    try {
      execSync(command, { 
        stdio: 'inherit',
        env: { ...process.env, FORCE_COLOR: '1' }
      });
    } catch (error) {
      throw new Error(`Command failed: ${command}\n${error}`);
    }
  }

  private validateFiles(files: string[]): void {
    const missingFiles = files.filter(file => 
      !fs.existsSync(path.join(process.cwd(), file))
    );

    if (missingFiles.length > 0) {
      throw new Error(`Missing files:\n${missingFiles.join('\n')}`);
    }
  }

  async runTask(taskName: string): Promise<void> {
    console.log(`\n🚀 Starting task: ${taskName}`);

    const task = this.tasksConfig[taskName];
    if (!task) {
      throw new Error(`Task '${taskName}' not found in configuration`);
    }

    for (const step of task.steps) {
      try {
        console.log(`\n📋 Executing step: ${step.name}`);
        
        // Validate files exist
        this.validateFiles(step.files);
        
        // Run TypeScript check
        console.log('Running type check...');
        await this.executeCommand('npm run typecheck');
        
        // Run ESLint
        console.log('Running linter...');
        await this.executeCommand('npm run lint');
        
        console.log(`✅ Completed step: ${step.name}`);
      } catch (error) {
        console.error(`\n❌ Step failed: ${step.name}`);
        console.error(error);
        process.exit(1);
      }
    }

    console.log(`\n✨ Task ${taskName} completed successfully!`);
  }
}

// Export singleton instance
export default new TaskRunner(); 