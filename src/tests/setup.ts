import { config } from 'dotenv';
import { jest } from '@jest/globals';
import { closeTestDB, setupTestDB } from './utils/testUtils';
import path from 'path';
import mongoose from 'mongoose';
import Redis from 'ioredis';

// Load environment variables from the test env file
config({ path: path.resolve(process.cwd(), '.env.test') });

// Create a separate database for testing
const dbName = process.env.MONGODB_DB_NAME || 'gaiathon_test';
const originalUri = process.env.MONGODB_URI || '';
process.env.MONGODB_URI = originalUri.replace(/\/[^/?]+\?/, `/${dbName}?`);

// Redis client for testing
let redis: Redis;

// Increase timeout for all tests
jest.setTimeout(120000);

// Mock NextAuth session
declare global {
  // eslint-disable-next-line no-var
  var _mockSession: any;
}

global._mockSession = null;

jest.mock('next-auth', () => {
  return {
    getServerSession: jest.fn(() => {
      return global._mockSession;
    })
  };
});

// Setup before all tests
beforeAll(async () => {
  try {
    // Connect to MongoDB
    await setupTestDB();
    
    // Initialize Redis connection
    redis = new Redis({
      host: process.env.REDIS_HOST || 'redis',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      maxRetriesPerRequest: 5,
      retryStrategy: (times: number) => {
        if (times > 5) {
          throw new Error('Redis connection failed');
        }
        return Math.min(times * 100, 3000);
      }
    });

    // Test Redis connection
    await redis.ping();
    
    console.log('Test environment setup completed');
    console.log(`MongoDB URI: ${process.env.MONGODB_URI}`);
    console.log(`Redis URL: redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`);
  } catch (error) {
    console.error('Error setting up test environment:', error);
    throw error;
  }
});

// Clean up before each test
beforeEach(async () => {
  try {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Clean MongoDB collections
    if (mongoose.connection.db) {
      const collections = await mongoose.connection.db.collections();
      for (const collection of collections) {
        await collection.deleteMany({});
      }
    }
    
    // Clean Redis
    if (redis) {
      await redis.flushall();
    }
  } catch (error) {
    console.error('Error cleaning test environment:', error);
    throw error;
  }
});

// Clean up after all tests
afterAll(async () => {
  try {
    // Close MongoDB connection
    await closeTestDB();
    
    // Close Redis connection
    if (redis) {
      await redis.quit();
    }
    
    console.log('Test environment cleanup completed');
  } catch (error) {
    console.error('Error cleaning up test environment:', error);
    throw error;
  }
}); 
