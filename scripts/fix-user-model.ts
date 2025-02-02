import { config } from 'dotenv';
import path from 'path';
import { connectDB } from '../src/lib/mongodb';
import { User } from '../src/lib/db/models/User';
import { hash, compare } from 'bcryptjs';

async function fixUserModel() {
  try {
    // Load environment variables
    const envPath = path.resolve(process.cwd(), '.env');
    config({ path: envPath });

    console.log('Connecting to database...');
    await connectDB();

    // Find the admin user
    const adminEmail = process.env.ADMIN_EMAIL;
    console.log('Looking for admin user:', adminEmail);
    
    const adminUser = await User.findOne({ email: adminEmail });
    
    if (!adminUser) {
      console.error('Admin user not found!');
      process.exit(1);
    }

    console.log('Found admin user:', {
      email: adminUser.email,
      role: adminUser.role,
      name: adminUser.name
    });

    // Create a new password hash
    const plainPassword = process.env.ADMIN_PASSWORD!;
    const newHash = await hash(plainPassword, 12);

    // Test direct comparison
    const directCompare = await compare(plainPassword, newHash);
    console.log('Direct comparison result:', directCompare);

    // Update the user's password
    adminUser.password = newHash;
    await adminUser.save();
    console.log('Updated admin password');

    // Test the comparison method
    const modelCompare = await adminUser.comparePassword(plainPassword);
    console.log('Model comparison result:', modelCompare);

  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

fixUserModel(); 