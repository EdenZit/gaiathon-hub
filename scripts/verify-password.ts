import { config } from 'dotenv';
import path from 'path';
import { connectDB } from '../src/lib/mongodb';
import { User } from '../src/lib/db/models/User';
import { hash, compare } from 'bcryptjs';

async function verifyPassword() {
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

    console.log('Found user:', {
      email: adminUser.email,
      role: adminUser.role,
      name: adminUser.name
    });

    // Test password comparison
    const plainPassword = process.env.ADMIN_PASSWORD!;
    console.log('Testing password comparison...');
    
    // Direct comparison using bcryptjs
    const isValidDirect = await compare(plainPassword, adminUser.password);
    console.log('Direct bcrypt comparison result:', isValidDirect);

    // Using model method
    const isValidModel = await adminUser.comparePassword(plainPassword);
    console.log('Model method comparison result:', isValidModel);

    // Create new hash and update
    console.log('Updating password...');
    const newHash = await hash(plainPassword, 12);
    adminUser.password = newHash;
    await adminUser.save();
    console.log('Password updated successfully');

    // Verify new password
    const finalCheck = await compare(plainPassword, adminUser.password);
    console.log('Final password verification:', finalCheck);

  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

verifyPassword(); 