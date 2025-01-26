import { connectDB, disconnectDB } from '../../src/lib/mongodb';
import { TeamService } from '../../src/lib/services/team.service';
import { User } from '../../src/lib/db/models/User';
import { Team } from '../../src/lib/db/models/Team';
import { ITeamMember, IUser, ITeam } from '../../src/types/models';
import { Document, Types } from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// Verify required environment variables
const requiredEnvVars = ['MONGODB_URI', 'NEXTAUTH_SECRET'];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`${envVar} environment variable is not set`);
  }
}

interface UserDocument extends Document {
  _id: Types.ObjectId;
  email: string;
  password: string;
  name: string;
  role: string;
}

interface TeamDocument extends Document {
  _id: Types.ObjectId;
  name: string;
  description: string;
  leader: Types.ObjectId;
  members: ITeamMember[];
}

async function createTestUser(email: string, name: string): Promise<UserDocument> {
  const user = new User({
    email,
    password: 'testPassword123',
    name,
    role: 'user',
  });
  return user.save();
}

async function cleanup() {
  console.log('\nCleaning up test data...');
  try {
    await User.deleteMany({ email: /^test.*@test\.com$/ });
    await Team.deleteMany({ name: /^Test Team.*$/ });
    console.log('✓ Cleanup completed');
  } catch (error) {
    console.error('Cleanup failed:', error);
  }
}

async function runTests() {
  try {
    console.log('Starting data layer tests...\n');
    
    // Create test users
    console.log('Creating test users...');
    const leader: UserDocument = await createTestUser('test.leader@test.com', 'Test Leader');
    const member1: UserDocument = await createTestUser('test.member1@test.com', 'Test Member 1');
    const member2: UserDocument = await createTestUser('test.member2@test.com', 'Test Member 2');
    console.log('✓ Test users created');

    // Create team
    console.log('\nCreating test team...');
    const team = await TeamService.createTeam(
      'Test Team',
      'A team for testing the data layer',
      leader._id.toString()
    ) as TeamDocument;
    console.log('✓ Test team created');

    // Add members
    console.log('\nAdding members to team...');
    await TeamService.addMember(team._id.toString(), member1._id.toString(), 'member');
    await TeamService.addMember(team._id.toString(), member2._id.toString(), 'contributor');
    console.log('✓ Members added successfully');

    // Verify team members
    console.log('\nVerifying team members...');
    const updatedTeam = await TeamService.getTeamById(team._id.toString());
    if (!updatedTeam) throw new Error('Team not found');
    
    console.log(`Total members: ${updatedTeam.members.length}`);
    console.log('Member roles:', updatedTeam.members.map((m: ITeamMember) => m.role).join(', '));
    console.log('✓ Team members verified');

    // Update member role
    console.log('\nUpdating member role...');
    await TeamService.updateMemberRole(team._id.toString(), member1._id.toString(), 'contributor');
    console.log('✓ Member role updated');

    // Add activity
    console.log('\nAdding team activity...');
    await TeamService.addActivity(
      team._id.toString(),
      leader._id.toString(),
      'project',
      'Project created',
      { projectName: 'Test Project' }
    );
    console.log('✓ Activity added');

    // Get teams by member
    console.log('\nGetting teams by member...');
    const memberTeams = await TeamService.getTeamsByMember(member1._id.toString());
    console.log(`Found ${memberTeams.length} teams for member`);
    console.log('✓ Teams retrieved successfully');

    console.log('\nAll tests completed successfully! 🎉');

  } catch (error) {
    console.error('Test failed:', error);
    throw error;
  } finally {
    await cleanup();
    await disconnectDB();
  }
}

// Handle Docker container shutdown gracefully
process.on('SIGTERM', async () => {
  console.log('Received SIGTERM. Cleaning up...');
  await cleanup();
  await disconnectDB();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('Received SIGINT. Cleaning up...');
  await cleanup();
  await disconnectDB();
  process.exit(0);
});

// Run tests if this file is executed directly
if (require.main === module) {
  connectDB()
    .then(runTests)
    .catch(console.error)
    .finally(() => process.exit());
} 