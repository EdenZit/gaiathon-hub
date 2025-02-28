import { connectDB } from '../../src/lib/mongodb';
import { Team } from '../../src/lib/db/models/Team';
import { Types } from 'mongoose';

async function migrateTeamMembers() {
  try {
    console.log('Connecting to database...');
    await connectDB();

    console.log('Fetching all teams...');
    const teams = await Team.find({}).lean();
    console.log(`Found ${teams.length} teams to migrate`);

    for (const team of teams) {
      console.log(`Migrating team: ${team.name}`);
      
      // Convert old members array to new structure
      const newMembers = team.members.map((member: any) => {
        // Handle case where member is already in the new format
        if (member.user && member.teamRole) {
          return member;
        }

        // Handle case where member is just an ObjectId
        const memberId = member._id ? member._id.toString() : member.toString();
        return {
          user: new Types.ObjectId(memberId),
          teamRole: memberId === team.leaderId.toString() ? 'leader' : 'member',
          joinedAt: team.createdAt
        };
      });

      // Update team with new member structure
      await Team.findByIdAndUpdate(team._id, {
        $set: { members: newMembers }
      }, { new: true });

      console.log(`Successfully migrated team: ${team.name}`);
    }

    console.log('Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrateTeamMembers(); 