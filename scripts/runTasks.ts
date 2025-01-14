import taskRunner from './taskRunner';

async function main() {
  try {
    console.log('🔄 Starting task execution...');
    
    // Run tasks in sequence
    await taskRunner.runTask('database-consolidation');
    await taskRunner.runTask('api-standardization');
    await taskRunner.runTask('model-verification');
    
    console.log('\n✅ All tasks completed successfully!');
  } catch (error) {
    console.error('\n❌ Task execution failed:');
    console.error(error);
    process.exit(1);
  }
}

// Add error handling for uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

main(); 