import mongoose from 'mongoose';
import { config } from 'dotenv';

// Load environment variables
config();

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

interface MongooseCache {
  conn: mongoose.Connection | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var mongoose: { cache?: MongooseCache };
}

let cached: MongooseCache = global.mongoose?.cache || { conn: null, promise: null };

if (!global.mongoose) {
  global.mongoose = { cache: cached };
}

export async function connectDB(): Promise<mongoose.Connection> {
  if (cached.conn) {
    console.log('Using cached MongoDB connection');
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: true,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4
    };

    console.log('Connecting to MongoDB...');
    cached.promise = mongoose
      .connect(MONGODB_URI!)
      .then((mongoose) => {
        console.log('MongoDB connected successfully');
        return mongoose;
      })
      .catch((error) => {
        console.error('MongoDB connection error:', error);
        throw error;
      });
  }

  try {
    const mongoose = await cached.promise;
    cached.conn = mongoose.connection;
  } catch (error) {
    cached.promise = null;
    throw error;
  }

  return cached.conn;
}

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received. Closing MongoDB connection...');
  await mongoose.disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received. Closing MongoDB connection...');
  await mongoose.disconnect();
  process.exit(0);
}); 