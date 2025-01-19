const mongoose = require('mongoose');
require('dotenv').config();

async function cleanDatabase() {
  try {
    // Get MongoDB URI from environment variables
    const MONGODB_URI = process.env.MONGODB_URI || process.env.NEXT_PUBLIC_MONGODB_URI;
    if (!MONGODB_URI) {
      throw new Error('MongoDB URI not found in environment variables');
    }

    console.log('Connecting to MongoDB Atlas...');
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected successfully to MongoDB Atlas');

    // Get list of all collections
    console.log('Fetching collections...');
    const collections = await mongoose.connection.db.collections();
    console.log(`Found ${collections.length} collections`);

    // Clean each collection
    console.log('\nCleaning collections:');
    for (const collection of collections) {
      try {
        const result = await collection.deleteMany({});
        console.log(`✓ Deleted ${result.deletedCount} documents from ${collection.collectionName}`);
      } catch (error) {
        console.error(`✗ Error cleaning ${collection.collectionName}:`, error.message);
      }
    }

    console.log('\nDatabase cleanup completed');
  } catch (error) {
    console.error('\nError:', error.message);
    process.exit(1);
  } finally {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
      console.log('Disconnected from MongoDB Atlas');
    }
  }
}

// Add warning prompt
console.log('\n⚠️  WARNING: This will delete ALL data from the database!');
console.log('Are you sure you want to continue? (y/n)');

process.stdin.once('data', async (data) => {
  const input = data.toString().trim().toLowerCase();
  if (input === 'y') {
    await cleanDatabase();
    process.exit(0);
  } else {
    console.log('Operation cancelled');
    process.exit(0);
  }
}); 