import { execSync } from 'child_process';
import * as yaml from 'yaml';
import * as fs from 'fs';
import * as path from 'path';

interface ComposerConfig {
  name: string;
  version: string;
  tasks: Record<string, TaskGroup[]>;
  validation: {
    typescript: {
      config: string;
      strict: boolean;
    };
  };
}

interface TaskGroup {
  name: string;
  files: string[];
  rules: string[];
}

class Composer {
  private config: ComposerConfig;

  constructor() {
    const configPath = path.join(process.cwd(), '.composer', 'config.yaml');
    const configFile = fs.readFileSync(configPath, 'utf8');
    this.config = yaml.parse(configFile);
  }

  async runTask(taskName: string) {
    console.log(`🚀 Running task: ${taskName}`);
    const taskGroup = this.config.tasks[taskName];

    if (!taskGroup) {
      throw new Error(`Task ${taskName} not found`);
    }

    for (const task of taskGroup) {
      console.log(`\n📝 Processing: ${task.name}`);
      
      // Validate files
      for (const filePattern of task.files) {
        console.log(`Checking files matching: ${filePattern}`);
        try {
          execSync(`tsc --noEmit ${filePattern}`, { stdio: 'inherit' });
        } catch (error) {
          console.error(`TypeScript errors in ${filePattern}`);
        }
      }
    }
  }

  async validateAll() {
    console.log('🔍 Running full TypeScript validation...');
    try {
      execSync('npm run typecheck', { stdio: 'inherit' });
      console.log('✅ TypeScript validation passed');
    } catch (error) {
      console.error('❌ TypeScript validation failed');
      throw error;
    }
  }
}

export default new Composer(); 