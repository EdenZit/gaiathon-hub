import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function checkMongoConnection() {
  const uri = process.env.MONGODB_URI;
  
  if (!uri) {
    console.error('❌ MONGODB_URI environment variable is not set');
    process.exit(1);
  }

  try {
    console.log('Attempting to connect to MongoDB Atlas...');
    console.log('Connection string:', uri.replace(/mongodb\+srv:\/\/([^:]+):([^@]+)@/, 'mongodb+srv://[username]:[password]@'));
    
    // Try to connect with timeout
    await Promise.race([
      mongoose.connect(uri),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Connection timeout after 10s')), 10000)
      )
    ]);

    console.log('✓ Successfully connected to MongoDB Atlas');
    
    // Verify database connection
    const db = mongoose.connection.db;
    if (!db) {
      throw new Error('Database connection not established');
    }
    
    // Get connection details
    const { host, port, name } = mongoose.connection;
    console.log('\nConnection Details:');
    console.log(`Host: ${host}`);
    console.log(`Port: ${port || 'default'}`);
    console.log(`Database: ${name}`);
    
    // Check collections
    const collections = await db.collections();
    console.log('\nAvailable Collections:');
    for (const collection of collections) {
      const count = await collection.countDocuments();
      console.log(`- ${collection.collectionName}: ${count} documents`);
    }

    // Check indexes
    console.log('\nChecking Indexes:');
    for (const collection of collections) {
      const indexes = await collection.indexes();
      console.log(`\n${collection.collectionName} indexes:`);
      indexes.forEach(index => {
        console.log(`- ${index.name}: ${JSON.stringify(index.key)}`);
      });
    }

    // Check database stats
    const stats = await db.stats();
    console.log('\nDatabase Stats:');
    console.log(`Storage Size: ${(stats.storageSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`Total Collections: ${stats.collections}`);
    console.log(`Total Documents: ${stats.objects}`);
    
    console.log('\n✓ Database check completed successfully');
  } catch (error) {
    console.error('\n❌ MongoDB Connection Error:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

// Handle Docker container shutdown gracefully
process.on('SIGTERM', async () => {
  console.log('Received SIGTERM. Cleaning up...');
  await mongoose.disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('Received SIGINT. Cleaning up...');
  await mongoose.disconnect();
  process.exit(0);
});

// Run the check if this file is executed directly
if (require.main === module) {
  checkMongoConnection().catch(console.error);
} 