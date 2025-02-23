import { config } from 'dotenv';
import mongoose from 'mongoose';

// Load environment variables
config();

// Construct MongoDB URI from components
function constructMongoDBUri(): string {
  const {
    MONGODB_USER,
    MONGODB_PASSWORD,
    MONGODB_CLUSTER,
    MONGODB_DATABASE,
    MONGODB_OPTIONS,
    MONGODB_URI
  } = process.env;

  // If MONGODB_URI is provided as a complete URL, use it
  if (MONGODB_URI?.startsWith('mongodb+srv://') || MONGODB_URI?.startsWith('mongodb://')) {
    return MONGODB_URI;
  }

  // Verify all required components are present
  if (!MONGODB_USER || !MONGODB_PASSWORD || !MONGODB_CLUSTER || !MONGODB_DATABASE) {
    throw new Error('Missing required MongoDB configuration. Please check your environment variables.');
  }

  // Construct the connection string
  const uri = `mongodb+srv://${MONGODB_USER}:${MONGODB_PASSWORD}@${MONGODB_CLUSTER}/${MONGODB_DATABASE}`;
  const options = MONGODB_OPTIONS || 'retryWrites=true&w=majority';
  
  return `${uri}?${options}`;
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

    const uri = constructMongoDBUri();
    // Log the connection string with credentials masked
    console.log('Connecting to MongoDB...', 
      uri.replace(/mongodb\+srv:\/\/([^:]+):([^@]+)@/, 'mongodb+srv://[username]:[password]@')
    );

    cached.promise = mongoose.connect(uri, opts).then((mongoose) => {
      console.log('New MongoDB connection established');
      return mongoose;
    });
  }

  try {
    const mongoose = await cached.promise;
    cached.conn = mongoose.connection;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export async function disconnectDB() {
  try {
    await mongoose.disconnect();
    cached.conn = null;
    cached.promise = null;
    console.log('Disconnected from MongoDB Atlas');
  } catch (e) {
    console.error('Error disconnecting from MongoDB Atlas:', e);
    throw e;
  }
}

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received. Closing MongoDB Atlas connection...');
  await disconnectDB();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received. Closing MongoDB Atlas connection...');
  await disconnectDB();
  process.exit(0);
}); 