import { MongoClient } from 'mongodb';
import * as dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

async function updateMongoDBUser() {
  const adminUri = process.env.MONGODB_URI?.replace(
    process.env.MONGODB_DATABASE as string,
    'admin'
  );
  
  if (!adminUri) {
    throw new Error('MongoDB URI not found in environment variables');
  }

  const client = new MongoClient(adminUri);

  try {
    console.log('🔄 Connecting to MongoDB Atlas...');
    await client.connect();

    const adminDb = client.db('admin');

    // Update user password
    await adminDb.command({
      updateUser: process.env.MONGODB_USER,
      pwd: process.env.MONGODB_PASSWORD,
      roles: [
        { role: 'readWrite', db: process.env.MONGODB_DATABASE },
        { role: 'dbAdmin', db: process.env.MONGODB_DATABASE }
      ]
    });

    console.log(`✅ Successfully updated password for user: ${process.env.MONGODB_USER}`);
    
    // Test the new credentials
    console.log('\n🔍 Testing new credentials...');
    
    // Close the admin connection
    await client.close();
    
    // Try connecting with new credentials
    const appClient = new MongoClient(process.env.MONGODB_URI as string);
    await appClient.connect();
    
    // Test the connection
    const db = appClient.db(process.env.MONGODB_DATABASE);
    await db.command({ ping: 1 });
    
    console.log('✅ Successfully connected with new credentials');
    
    await appClient.close();
  } catch (error) {
    console.error('❌ Failed to update MongoDB user:', error);
    throw error;
  } finally {
    await client.close();
  }
}

async function main() {
  try {
    console.log('🔐 Starting MongoDB user update process...\n');
    
    // Show the current configuration
    console.log('Current Configuration:');
    console.log(`Database: ${process.env.MONGODB_DATABASE}`);
    console.log(`User: ${process.env.MONGODB_USER}`);
    console.log(`Cluster: ${process.env.MONGODB_CLUSTER}`);
    console.log(''); // Empty line for spacing
    
    // Update the user
    await updateMongoDBUser();
    
    console.log('\n✨ MongoDB user update completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ MongoDB user update failed');
    process.exit(1);
  }
}

// Instructions for manual update in MongoDB Atlas
console.log(`
📝 Manual Update Instructions (if script fails):

1. Log in to MongoDB Atlas
2. Navigate to Security > Database Access
3. Find user: ${process.env.MONGODB_USER}
4. Click "Edit"
5. Choose "Update Password"
6. Enter new password: ${process.env.MONGODB_PASSWORD}
7. Click "Update User"

Test the new credentials using:
npm run test-connections
`);

// Ask for confirmation before proceeding
process.stdout.write('\nProceed with automatic update? (y/N): ');
process.stdin.once('data', (data) => {
  const input = data.toString().trim().toLowerCase();
  if (input === 'y') {
    main();
  } else {
    console.log('\nUpdate cancelled. Please follow the manual instructions above.');
    process.exit(0);
  }
}); 