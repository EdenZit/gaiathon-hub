import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { MongoClient } from 'mongodb';

dotenv.config();

interface MigrationLog {
  step: string;
  status: 'pending' | 'completed' | 'failed';
  error?: any;
  timestamp: Date;
}

async function connectToMongoDB() {
  const uri = process.env.DATABASE_URL;
  if (!uri) {
    throw new Error('DATABASE_URL environment variable is not set');
  }

  try {
    await mongoose.connect(uri);
    console.log('Connected to MongoDB Atlas');
  } catch (error) {
    console.error('Failed to connect to MongoDB Atlas:', error);
    throw error;
  }
}

async function createMigrationLog(db: mongoose.Connection) {
  const migrationSchema = new mongoose.Schema<MigrationLog>({
    step: String,
    status: String,
    error: mongoose.Schema.Types.Mixed,
    timestamp: Date,
  });

  return db.model<MigrationLog>('MigrationLog', migrationSchema);
}

async function migrateTeamData() {
  console.log('Starting team data migration...');
  
  const db = mongoose.connection;
  const MigrationLog = await createMigrationLog(db);

  try {
    // Log migration start
    await MigrationLog.create({
      step: 'start',
      status: 'pending',
      timestamp: new Date(),
    });

    // 1. Update team document paths
    console.log('Updating team document paths...');
    await db.collection('teams').updateMany(
      {},
      {
        $rename: {
          'resourcePath': 'teamPath',
          'workspacePath': 'teamWorkspacePath'
        }
      }
    );

    // 2. Update file storage references
    console.log('Updating file storage references...');
    await db.collection('files').updateMany(
      { path: /^\/resources\/team-workspace/ },
      [{
        $set: {
          path: {
            $replaceOne: {
              input: '$path',
              find: '/resources/team-workspace',
              replacement: '/teams'
            }
          }
        }
      }]
    );

    // 3. Update team member permissions
    console.log('Updating team member permissions...');
    await db.collection('team_members').updateMany(
      {},
      {
        $set: {
          'permissions.newStructure': true
        }
      }
    );

    // 4. Update team invites
    console.log('Updating team invites...');
    await db.collection('team_invites').updateMany(
      {},
      [{
        $set: {
          inviteUrl: {
            $replaceOne: {
              input: '$inviteUrl',
              find: '/resources/team-workspace',
              replacement: '/teams'
            }
          }
        }
      }]
    );

    // Log successful completion
    await MigrationLog.create({
      step: 'complete',
      status: 'completed',
      timestamp: new Date(),
    });

    console.log('Team data migration completed successfully!');

  } catch (error) {
    // Log error
    await MigrationLog.create({
      step: 'error',
      status: 'failed',
      error,
      timestamp: new Date(),
    });

    console.error('Migration failed:', error);
    throw error;
  }
}

async function validateMigration() {
  console.log('Validating migration...');
  
  const db = mongoose.connection;
  
  // Check for any documents with old paths
  const oldPathsCount = await db.collection('teams').countDocuments({
    $or: [
      { resourcePath: { $exists: true } },
      { workspacePath: { $exists: true } }
    ]
  });

  if (oldPathsCount > 0) {
    console.warn(`Warning: Found ${oldPathsCount} documents with old paths`);
  }

  // Check for any files with old storage paths
  const oldStorageCount = await db.collection('files').countDocuments({
    path: /^\/resources\/team-workspace/
  });

  if (oldStorageCount > 0) {
    console.warn(`Warning: Found ${oldStorageCount} files with old storage paths`);
  }

  console.log('Validation complete');
}

async function main() {
  try {
    await connectToMongoDB();
    await migrateTeamData();
    await validateMigration();
    
    console.log('\nNext steps:');
    console.log('1. Verify all team data is accessible in the new structure');
    console.log('2. Test team workspace functionality');
    console.log('3. Monitor for any errors in production logs');
    console.log('4. Keep backups for at least 7 days');
    
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

// Run migration
if (require.main === module) {
  main().catch(console.error);
} 