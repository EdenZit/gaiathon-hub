import mongoose, { Connection } from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env');
}

interface MongooseConnection {
  conn: Connection | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var mongoose: MongooseConnection | undefined;
}

if (!global.mongoose) {
  global.mongoose = { conn: null, promise: null };
}

const cached = global.mongoose!;

export async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: true,
      maxPoolSize: 10,
      minPoolSize: 5,
      socketTimeoutMS: 45000,
      serverSelectionTimeoutMS: 5000,
      family: 4, // Use IPv4, skip trying IPv6
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
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
  } catch (e) {
    console.error('Error disconnecting from MongoDB:', e);
    throw e;
  }
}

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received. Closing MongoDB connection...');
  await disconnectDB();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received. Closing MongoDB connection...');
  await disconnectDB();
  process.exit(0);
}); 