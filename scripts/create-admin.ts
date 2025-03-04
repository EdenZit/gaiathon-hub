import { connectDB } from '../src/lib/mongodb';
import { User } from '../src/lib/db/models/User';
import bcrypt from 'bcryptjs';

async function createAdminUser() {
  try {
    await connectDB();
    
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;
    
    if (!adminEmail || !adminPassword) {
      console.error('Admin credentials not found in environment variables');
      process.exit(1);
    }

    // Create salt and hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(adminPassword, salt);

    // Check if admin exists
    const existingAdmin = await User.findOne({ email: adminEmail.toLowerCase() });
    
    if (existingAdmin) {
      console.log('Updating existing admin user password...');
      existingAdmin.password = hashedPassword;
      await existingAdmin.save();
      console.log('Admin password updated successfully');
      process.exit(0);
    }

    // Create new admin user
    const adminUser = new User({
      email: adminEmail.toLowerCase(),
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      name: 'Admin User',
      role: 'admin',
      status: 'active',
      teamRole: 'leader',
      profileCompleted: true
    });

    await adminUser.save();
    console.log('Admin user created successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error creating/updating admin user:', error);
    process.exit(1);
  }
}

createAdminUser(); 