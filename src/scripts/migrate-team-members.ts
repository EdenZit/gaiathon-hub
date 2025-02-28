import { connectDB } from '@/lib/mongodb';
import { Team } from '@/lib/db/models/Team';
import { User } from '@/lib/db/models/User';
import { Types } from 'mongoose';

async function migrateTeamMembers() {
  try {
    await connectDB();
    console.log('Connected to MongoDB');

    // Find all teams
    const teams = await Team.find({}).lean();
    console.log(`Found ${teams.length} teams to migrate`);

    for (const team of teams) {
      // Skip if team has no members
      if (!team.members || team.members.length === 0) {
        console.log(`Team ${team._id}: No members to migrate`);
        continue;
      }

      const updatedMembers = [];
      for (const member of team.members) {
        // Find user by email or userId
        const user = await User.findOne({
          $or: [
            { _id: member.userId || member.user },
            { email: member.email }
          ]
        });

        if (!user) {
          console.log(`Warning: User not found for member in team ${team._id}`);
          continue;
        }

        updatedMembers.push({
          user: user._id,
          teamRole: member.teamRole || 'member',
          joinedAt: member.joinedAt || team.createdAt || new Date()
        });
      }

      // Update team with new member structure
      await Team.findByIdAndUpdate(team._id, {
        $set: { members: updatedMembers }
      });

      console.log(`Migrated team ${team._id} with ${updatedMembers.length} members`);
    }

    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    process.exit();
  }
}

migrateTeamMembers(); 