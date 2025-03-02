const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.production' });

async function testConnection() {
  try {
    console.log('Testing MongoDB connection...');
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB connection successful!');
    
    // Test basic operations
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('\nAvailable collections:');
    collections.forEach(collection => console.log(`- ${collection.name}`));
    
    console.log('\nConnection details:');
    console.log(`Database: ${mongoose.connection.db.databaseName}`);
    console.log(`Host: ${mongoose.connection.host}`);
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('\nConnection closed.');
  }
}

testConnection(); 