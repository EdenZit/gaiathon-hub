import { config } from 'dotenv';
import path from 'path';
import { connectDB } from '../src/lib/mongodb';
import { User } from '../src/lib/db/models/User';
import { hash } from 'bcryptjs';

async function checkAdmin() {
  try {
    // Load environment variables
    const envPath = path.resolve(process.cwd(), '.env');
    config({ path: envPath });

    console.log('Connecting to database...');
    await connectDB();

    // Find the admin user
    const adminEmail = process.env.ADMIN_EMAIL;
    console.log('Looking for admin user:', adminEmail);
    
    // First, find by email without role restriction
    const existingUser = await User.findOne({ email: adminEmail });
    
    if (!existingUser) {
      console.log('No user found with this email, creating new admin...');
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
    } else {
      console.log('Found existing user:', {
        email: existingUser.email,
        role: existingUser.role,
        name: existingUser.name
      });

      // Update the existing user to be admin
      console.log('Updating user to admin role...');
      existingUser.role = 'admin';
      existingUser.name = 'Admin User';
      existingUser.firstName = 'Admin';
      existingUser.lastName = 'User';
      existingUser.status = 'active';
      existingUser.profile = {
        organization: 'GAIAthon Hub',
        position: 'System Administrator',
        bio: 'System Administrator for GAIAthon Hub',
        skills: ['administration', 'system management']
      };

      // Update password
      const hashedPassword = await hash(process.env.ADMIN_PASSWORD!, 12);
      existingUser.password = hashedPassword;

      await existingUser.save();
      console.log('Existing user updated to admin successfully!');
    }

    // Verify the final state
    const finalAdmin = await User.findOne({ email: adminEmail });
    console.log('Final admin user state:', {
      email: finalAdmin?.email,
      role: finalAdmin?.role,
      name: finalAdmin?.name,
      firstName: finalAdmin?.firstName,
      lastName: finalAdmin?.lastName,
      status: finalAdmin?.status,
      profile: finalAdmin?.profile
    });

  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

checkAdmin(); 