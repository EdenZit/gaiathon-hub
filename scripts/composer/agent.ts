import Composer from './index';

interface AgentCommand {
  command: string;
  description: string;
  action: () => Promise<void>;
}

const commands: Record<string, AgentCommand> = {
  'auth': {
    command: 'composer:auth',
    description: 'Fix authentication component types',
    action: async () => await Composer.runTask('typescript-fixes.auth')
  },
  'dashboard': {
    command: 'composer:dashboard',
    description: 'Fix dashboard component types',
    action: async () => await Composer.runTask('typescript-fixes.dashboard')
  },
  'api': {
    command: 'composer:api',
    description: 'Fix API route types',
    action: async () => await Composer.runTask('typescript-fixes.api')
  },
  'pages': {
    command: 'composer:pages',
    description: 'Fix page component types',
    action: async () => await Composer.runTask('typescript-fixes.pages')
  },
  'all': {
    command: 'composer:all',
    description: 'Fix all TypeScript issues',
    action: async () => {
      for (const cmd of ['auth', 'dashboard', 'api', 'pages']) {
        await commands[cmd].action();
      }
    }
  }
};

async function runAgent() {
  console.log('🤖 Composer Agent Started\n');
  
  const command = process.argv[2];
  if (!command) {
    console.log('Available commands:');
    Object.entries(commands).forEach(([key, cmd]) => {
      console.log(`- ${key}: ${cmd.description}`);
    });
    process.exit(0);
  }

  const selectedCommand = commands[command];
  if (!selectedCommand) {
    console.error(`Unknown command: ${command}`);
    process.exit(1);
  }

  console.log(`🚀 Running: ${selectedCommand.description}`);
  try {
    await selectedCommand.action();
    console.log(`\n✅ ${selectedCommand.description} completed successfully!`);
  } catch (error) {
    console.error(`\n❌ Error running ${command}:`, error);
    process.exit(1);
  }
}

runAgent(); 