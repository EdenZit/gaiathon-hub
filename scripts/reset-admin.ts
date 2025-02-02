import { config } from 'dotenv';
import path from 'path';
import { connectDB } from '../src/lib/mongodb';
import { User } from '../src/lib/db/models/User';
import { hash } from 'bcryptjs';

async function resetAdmin() {
  try {
    // Load environment variables
    const envPath = path.resolve(process.cwd(), '.env');
    config({ path: envPath });

    console.log('Connecting to database...');
    await connectDB();

    // Delete existing admin user
    const adminEmail = process.env.ADMIN_EMAIL;
    console.log('Deleting existing admin user:', adminEmail);
    await User.deleteOne({ email: adminEmail });

    // Create new admin user
    console.log('Creating new admin user...');
    const hashedPassword = await hash(process.env.ADMIN_PASSWORD!, 12);
    const newAdmin = new User({
      email: process.env.ADMIN_EMAIL,
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
    });

    await newAdmin.save();
    console.log('New admin user created successfully!');

    // Verify the new admin
    const verifyAdmin = await User.findOne({ email: adminEmail });
    console.log('New admin user details:', {
      email: verifyAdmin?.email,
      role: verifyAdmin?.role,
      name: verifyAdmin?.name,
      status: verifyAdmin?.status
    });

    // Test password
    const testPassword = await verifyAdmin?.comparePassword(process.env.ADMIN_PASSWORD!);
    console.log('Password verification:', testPassword);

  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

resetAdmin(); 