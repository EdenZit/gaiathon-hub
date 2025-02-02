import { config } from 'dotenv';
import path from 'path';
import fs from 'fs';

// Force reload environment variables
const envPath = path.resolve(process.cwd(), '.env');
if (!fs.existsSync(envPath)) {
  throw new Error(`.env file not found at ${envPath}`);
}

const envConfig = fs.readFileSync(envPath, 'utf8');
const envVars = envConfig.split('\n').reduce((acc: Record<string, string>, line) => {
  const match = line.match(/^([^#\s][^=]+)=(.*)$/);
  if (match) {
    const [, key, value] = match;
    acc[key.trim()] = value.trim();
  }
  return acc;
}, {});

// Set environment variables
Object.entries(envVars).forEach(([key, value]) => {
  process.env[key] = value;
});

console.log('Environment loading results:', {
  envPath,
  varsLoaded: Object.keys(envVars).length,
  mongoURILoaded: !!process.env.MONGODB_URI
});

console.log('Environment variables:', {
  MONGODB_URI: process.env.MONGODB_URI,
  ADMIN_EMAIL: process.env.ADMIN_EMAIL,
  NODE_ENV: process.env.NODE_ENV
});

// Now import the rest
import { connectDB } from '../src/lib/mongodb';
import { User } from '../src/lib/db/models/User';
import { hash } from 'bcryptjs';

async function validateEnvironment() {
  const requiredEnvVars = [
    'MONGODB_URI',
    'ADMIN_EMAIL',
    'ADMIN_PASSWORD'
  ];

  const missingEnvVars = requiredEnvVars.filter(
    (envVar) => !process.env[envVar]
  );

  if (missingEnvVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingEnvVars.join(', ')}\n` +
      `Please check your .env file and ensure all required variables are set.`
    );
  }

  // Validate MongoDB URI format
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri?.includes('mongodb+srv://')) {
    throw new Error('MONGODB_URI must be a valid MongoDB Atlas URI (mongodb+srv://)');
  }
}

async function seedAdmin() {
  try {
    // Validate environment first
    await validateEnvironment();

    // Connect to database with retry logic
    let retries = 5;
    while (retries > 0) {
      try {
        await connectDB();
        console.log('Connected to MongoDB Atlas');
        break;
      } catch (error) {
        retries--;
        if (retries === 0) throw error;
        console.log(`Connection failed, retrying... (${retries} attempts left)`);
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }

    // Check if admin user already exists
    const existingAdmin = await User.findOne({ 
      email: process.env.ADMIN_EMAIL,
      role: 'admin'
    });

    if (existingAdmin) {
      console.log('Admin user exists, updating role...');
      existingAdmin.role = 'admin';
      await existingAdmin.save();
      console.log('Admin role updated successfully');
      process.exit(0);
    }

    // Create admin user with proper validation
    const hashedPassword = await hash(process.env.ADMIN_PASSWORD!, 12);
    const adminUser = new User({
      email: process.env.ADMIN_EMAIL,
      password: hashedPassword,
      name: 'Admin User',
      role: 'admin',
      status: 'active',
      profile: {
        firstName: 'Admin',
        lastName: 'User',
        organization: 'GAIAthon Hub',
        position: 'System Administrator',
      }
    });

    // Validate the user object against our schema
    await adminUser.validate();

    // Save the new admin user
    await adminUser.save();
    console.log('Admin user created successfully');

    // Log success details (excluding sensitive info)
    console.log({
      message: 'Admin user seeded successfully',
      email: process.env.ADMIN_EMAIL,
      role: 'admin',
      environment: process.env.NODE_ENV
    });

  } catch (error) {
    console.error('Error seeding admin user:', error);
    process.exit(1);
  } finally {
    // Ensure proper cleanup
    if (process.env.NODE_ENV !== 'test') {
      try {
        const mongoose = (await import('mongoose')).default;
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB Atlas');
      } catch (error) {
        console.error('Error during cleanup:', error);
      }
      setTimeout(() => process.exit(0), 1000);
    }
  }
}

// Run the seed function
seedAdmin(); 