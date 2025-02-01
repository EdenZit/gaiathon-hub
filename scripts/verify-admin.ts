import { connectDB } from '@/lib/mongodb';
import { User } from '@/lib/db/models/User';
import mongoose from 'mongoose';

async function main() {
  console.log('🔄 Connecting to database...');
  await connectDB();
  console.log('Connected to MongoDB Atlas');

  const adminEmail = 'edenkranie@gmail.com';
  console.log('🔍 Looking for admin user:', adminEmail);

  let adminUser = await User.findOne({ email: adminEmail });

  if (!adminUser) {
    console.log('❌ Admin user not found. Creating new admin user...');
    adminUser = new User({
      email: adminEmail,
      password: 'Takingnew2025!',
      name: 'Eden Kranie',
      firstName: 'Eden',
      lastName: 'Kranie',
      role: 'admin',
      status: 'active',
      profile: {
        organization: 'GAIAthon',
        position: 'Administrator'
      }
    });
    await adminUser.save();
    console.log('✅ Admin user created successfully!');
  } else {
    console.log('✅ Admin user already exists!');
    
    // Update password using the model's pre-save hook
    adminUser.password = 'Takingnew2025!';
    
    // Update other required fields if missing
    adminUser.name = 'Eden Kranie';
    adminUser.firstName = 'Eden';
    adminUser.lastName = 'Kranie';
    adminUser.role = 'admin';
    adminUser.status = 'active'; // Explicitly set status to active
    
    if (!adminUser.profile?.organization) {
      adminUser.profile = {
        ...adminUser.profile,
        organization: 'GAIAthon',
        position: 'Administrator'
      };
    }
    
    await adminUser.save();
    console.log('✅ Admin user updated successfully!');
  }

  // Verify the password can be compared
  const testPassword = 'Takingnew2025!';
  const isPasswordValid = await adminUser.comparePassword(testPassword);
  console.log('Password verification test:', isPasswordValid ? '✅ Success' : '❌ Failed');

  // Verify user status
  console.log('User status:', adminUser.status);
  if (adminUser.status !== 'active') {
    console.log('❌ Warning: User status is not active!');
  }

  console.log('✅ Admin verification successful!');
  console.log('Admin user details:', {
    id: adminUser._id,
    email: adminUser.email,
    role: adminUser.role,
    name: adminUser.name,
    status: adminUser.status,
    organization: adminUser.profile?.organization
  });

  await mongoose.disconnect();
  console.log('Disconnected from MongoDB Atlas');
  console.log('👋 Database connection closed');
}

main().catch(console.error); 