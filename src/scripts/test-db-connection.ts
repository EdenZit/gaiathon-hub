import mongoose from 'mongoose';
import { connectDB } from '../lib/db/connection';

async function testConnection() {
  try {
    console.log('Testing MongoDB Atlas connection...');
    const connection = await connectDB();
    
    if (!connection.connection.db) {
      throw new Error('Database connection not established');
    }

    // Test the connection by getting server status
    const status = await connection.connection.db.admin().ping();
    console.log('MongoDB Atlas connection test result:', status);
    
    // Get database statistics
    const stats = await connection.connection.db.stats();
    console.log('Database statistics:', {
      collections: stats.collections,
      indexes: stats.indexes,
      avgObjSize: stats.avgObjSize,
      dataSize: stats.dataSize,
    });

    console.log('Connection test completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Connection test failed:', error);
    process.exit(1);
  }
}

testConnection(); 