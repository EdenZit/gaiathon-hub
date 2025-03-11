import { connectDB } from '../src/lib/mongodb';
import { User } from '../src/lib/db/models/User';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function updateUserStatus() {
  try {
    console.log('Connecting to MongoDB...');
    await connectDB();
    console.log('Connected to MongoDB');

    // Find all users without a status field or with undefined status
    const usersToUpdate = await User.find({
      $or: [
        { status: { $exists: false } },
        { status: null },
        { status: undefined }
      ]
    });

    console.log(`Found ${usersToUpdate.length} users without a status field`);

    if (usersToUpdate.length === 0) {
      console.log('No users need to be updated');
      process.exit(0);
    }

    // Update all users to have 'active' status
    const updateResult = await User.updateMany(
      {
        $or: [
          { status: { $exists: false } },
          { status: null },
          { status: undefined }
        ]
      },
      { $set: { status: 'active' } }
    );

    console.log(`Updated ${updateResult.modifiedCount} users to have 'active' status`);
    process.exit(0);
  } catch (error) {
    console.error('Error updating user status:', error);
    process.exit(1);
  }
}

updateUserStatus(); 