import { config } from 'dotenv';
import path from 'path';
import fs from 'fs';
import { hash } from 'bcryptjs';
import { connectDB } from '../src/lib/mongodb';
import { User } from '../src/lib/db/models/User';
import crypto from 'crypto';

// Load environment variables
config({ path: path.resolve(process.cwd(), '.env') });

async function generateSecurePassword(): Promise<string> {
  const length = 16;
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+';
  const bytes = crypto.randomBytes(length);
  const password = Array.from(bytes)
    .map(byte => charset[byte % charset.length])
    .join('');
  
  return password;
}

async function updateEnvFile(updates: Record<string, string>) {
  const envPath = path.resolve(process.cwd(), '.env');
  let envContent = fs.readFileSync(envPath, 'utf-8');

  Object.entries(updates).forEach(([key, value]) => {
    const regex = new RegExp(`${key}=.*`, 'g');
    if (envContent.match(regex)) {
      envContent = envContent.replace(regex, `${key}=${value}`);
    } else {
      envContent += `\n${key}=${value}`;
    }
  });

  // Create backup of current .env
  fs.writeFileSync(`${envPath}.backup`, fs.readFileSync(envPath));
  
  // Write new .env
  fs.writeFileSync(envPath, envContent);
}

async function rotateCredentials() {
  try {
    console.log('Starting credentials rotation...');

    // Generate new secure credentials
    const newAdminPassword = await generateSecurePassword();
    const newMongoPassword = await generateSecurePassword();

    // Update admin password in database
    console.log('Connecting to database...');
    await connectDB();

    const adminEmail = process.env.ADMIN_EMAIL;
    console.log('Finding admin user:', adminEmail);
    
    const adminUser = await User.findOne({ email: adminEmail });
    if (!adminUser) {
      throw new Error('Admin user not found');
    }

    // Hash and update admin password
    console.log('Updating admin password...');
    const hashedPassword = await hash(newAdminPassword, 12);
    adminUser.password = hashedPassword;
    await adminUser.save();

    // Update MongoDB Atlas password
    // Note: This requires MongoDB Atlas Admin API access
    // You'll need to implement this part according to your MongoDB Atlas setup
    console.log('Updating MongoDB password...');
    // TODO: Implement MongoDB Atlas password rotation

    // Update environment variables
    console.log('Updating environment variables...');
    const updates = {
      ADMIN_PASSWORD: newAdminPassword,
      // Update MongoDB URI with new password
      // MONGODB_URI: process.env.MONGODB_URI!.replace(
      //   /:([^:@]+)@/,
      //   `:${newMongoPassword}@`
      // )
    };

    await updateEnvFile(updates);

    console.log('Credentials rotation completed successfully!');
    console.log('New admin password:', newAdminPassword);
    // console.log('New MongoDB password:', newMongoPassword);
    console.log('\nPlease update these credentials in your secure password manager.');
    console.log('Remember to update the MongoDB Atlas password manually if automatic update is not implemented.');

  } catch (error) {
    console.error('Error rotating credentials:', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

// Run the rotation
rotateCredentials(); 