import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env');
}

export async function connectToDatabase() {
  try {
    const opts = {
      bufferCommands: false,
    };

    await mongoose.connect(MONGODB_URI!, opts);
    return mongoose;
  } catch (error) {
    console.error('Error connecting to database:', error);
    throw error;
  }
} 