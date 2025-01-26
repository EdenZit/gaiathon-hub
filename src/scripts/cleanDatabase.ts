import { connectDB, disconnectDB } from '@/lib/mongodb';
import { User } from '@/models/User';
import { Team } from '@/models/Team';
import { Document } from '@/models/Document';

async function cleanDatabase() {
  try {
    console.log('Connecting to database...');
    await connectDB();
    console.log('Connected successfully');

    console.log('Cleaning User collection...');
    const userResult = await User.deleteMany({});
    console.log(`Deleted ${userResult.deletedCount} users`);

    console.log('Cleaning Team collection...');
    const teamResult = await Team.deleteMany({});
    console.log(`Deleted ${teamResult.deletedCount} teams`);

    console.log('Cleaning Document collection...');
    const documentResult = await Document.deleteMany({});
    console.log(`Deleted ${documentResult.deletedCount} documents`);

    console.log('All collections cleaned successfully');
  } catch (error) {
    console.error('Error cleaning database:', error);
  } finally {
    await disconnectDB();
    console.log('Disconnected from database');
  }
}

cleanDatabase(); 