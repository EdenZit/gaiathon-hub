import { config } from 'dotenv';
import { resolve } from 'path';
import { connectDB } from '../src/lib/mongodb';
import { User } from '../src/lib/db/models/User';
import { hash } from 'bcryptjs';
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

async function fixAdmin() {
  try {
    // Load environment variables
    const envPath = resolve(process.cwd(), '.env');
    config({ path: envPath });

    console.log('Connecting to database...');
    await connectDB();

    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminEmail || !adminPassword) {
      throw new Error('Admin email or password not found in environment variables');
    }

    console.log('Looking for admin user:', adminEmail);
    let adminUser = await User.findOne({ email: adminEmail }) as IUserDocument | null;

    if (!adminUser) {
      console.log('Creating new admin user...');
      const hashedPassword = await hash(adminPassword, 12);
      adminUser = await User.create({
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
    } else {
      console.log('Updating existing admin user...');
      const hashedPassword = await hash(adminPassword, 12);
      adminUser.password = hashedPassword;
      adminUser.role = 'admin';
      adminUser.status = 'active';
      await adminUser.save();
    }

    console.log('Admin user saved successfully');

    // Verify the password works
    const isValid = await adminUser.comparePassword(adminPassword);
    console.log('Password verification:', isValid ? 'Success ✅' : 'Failed ❌');

    if (!isValid) {
      throw new Error('Password verification failed after update');
    }

    console.log('Admin user details:', {
      email: adminUser.email,
      role: adminUser.role,
      status: adminUser.status,
      name: adminUser.name
    });

  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

fixAdmin(); 