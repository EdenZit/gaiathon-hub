import { MongoClient } from 'mongodb';
import Redis from 'ioredis';
import * as dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

async function testMongoConnection() {
  const client = new MongoClient(process.env.MONGODB_URI as string);
  
  try {
    console.log('🔄 Testing MongoDB connection...');
    await client.connect();
    
    // Test the connection by listing databases
    const adminDb = client.db('admin');
    await adminDb.command({ ping: 1 });
    
    console.log('✅ MongoDB connection successful!');
    
    // Get server status and version
    const buildInfo = await adminDb.command({ buildInfo: 1 });
    console.log(`📊 MongoDB Version: ${buildInfo.version}`);
    
    // Test database access
    const db = client.db(process.env.MONGODB_DATABASE);
    const collections = await db.listCollections().toArray();
    console.log(`📁 Available collections: ${collections.map(c => c.name).join(', ')}`);
    
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
    throw error;
  } finally {
    await client.close();
  }
}

async function testRedisConnection() {
  const redis = new Redis(process.env.REDIS_URL as string);
  
  try {
    console.log('🔄 Testing Redis connection...');
    
    // Test connection with ping
    const pingResult = await redis.ping();
    if (pingResult !== 'PONG') {
      throw new Error('Redis ping failed');
    }
    
    console.log('✅ Redis connection successful!');
    
    // Get Redis info
    const info = await redis.info();
    const version = info.match(/redis_version:(\S+)/)?.[1];
    console.log(`📊 Redis Version: ${version}`);
    
    // Test basic operations
    await redis.set('test_key', 'test_value');
    const testValue = await redis.get('test_key');
    if (testValue !== 'test_value') {
      throw new Error('Redis read/write test failed');
    }
    console.log('✅ Redis read/write test passed');
    
    // Clean up test key
    await redis.del('test_key');
    
  } catch (error) {
    console.error('❌ Redis connection failed:', error);
    throw error;
  } finally {
    redis.disconnect();
  }
}

async function main() {
  try {
    console.log('🔍 Starting connection tests...\n');
    
    // Test MongoDB
    await testMongoConnection();
    console.log(''); // Empty line for spacing
    
    // Test Redis
    await testRedisConnection();
    console.log(''); // Empty line for spacing
    
    console.log('✨ All connection tests passed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Connection tests failed');
    process.exit(1);
  }
}

main(); 