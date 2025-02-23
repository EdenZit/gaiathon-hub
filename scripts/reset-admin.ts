import { config } from 'dotenv';
import { resolve } from 'path';
import { connectDB } from '../src/lib/mongodb';
import { User } from '../src/lib/db/models/User';
import { hash, compare } from 'bcryptjs';
import type { Document } from 'mongoose';

interface IUserDocument extends Document {
  email: string;
  password: string;
  name: string;
  firstName: string;
  lastName: string;
  role: 'user' | 'admin';
  status: 'active' | 'inactive';
  profile?: {
    organization: string;
    position: string;
    bio: string;
    skills: string[];
  };
  comparePassword(candidatePassword: string): Promise<boolean>;
}

async function resetAdmin() {
  try {
    // Load environment variables
    const envPath = resolve(process.cwd(), '.env');
    config({ path: envPath });

    console.log('Connecting to database...');
    await connectDB();

    // Delete existing admin user
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminEmail || !adminPassword) {
      throw new Error('Admin email or password not found in environment variables');
    }

    console.log('Deleting existing admin user:', adminEmail);
    await User.deleteOne({ email: adminEmail });

    // Create new admin user
    console.log('Creating new admin user...');
    const hashedPassword = await hash(adminPassword, 10);
    
    // Test direct password comparison
    const directCompare = await compare(adminPassword, hashedPassword);
    console.log('Direct password comparison:', directCompare ? 'Success ✅' : 'Failed ❌');

    const newAdmin = await User.create({
      email: adminEmail,
      password: hashedPassword,
      name: 'Admin User',
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin',
      status: 'active',
      profile: {
        organization: 'GAIAthon Hub',
        position: 'System Administrator',
        bio: 'System Administrator for GAIAthon Hub',
        skills: ['administration', 'system management']
      }
    }) as IUserDocument;

    console.log('New admin user created successfully!');

    // Verify the new admin
    const verifyAdmin = await User.findOne({ email: adminEmail }) as IUserDocument;
    console.log('New admin user details:', {
      email: verifyAdmin?.email,
      role: verifyAdmin?.role,
      name: verifyAdmin?.name,
      status: verifyAdmin?.status
    });

    // Test password using both methods
    const modelCompare = await verifyAdmin.comparePassword(adminPassword);
    const directCompare2 = await compare(adminPassword, verifyAdmin.password);
    
    console.log('Password verification (model):', modelCompare ? 'Success ✅' : 'Failed ❌');
    console.log('Password verification (direct):', directCompare2 ? 'Success ✅' : 'Failed ❌');

    if (!modelCompare) {
      throw new Error('Password verification failed after reset');
    }

  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

resetAdmin(); 