import mongoose from 'mongoose';
import dotenv from 'dotenv';

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

// Export the migration function
export const migrateTeamData = async (): Promise<void> => {
  console.log('Starting team data migration...');
  
  let db: mongoose.Connection | null = null;
  let MigrationLog: mongoose.Model<MigrationLog> | null = null;

  try {
    await connectToMongoDB();
    db = mongoose.connection;
    MigrationLog = await createMigrationLog(db);

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

    // Log successful completion
    await MigrationLog.create({
      step: 'complete',
      status: 'completed',
      timestamp: new Date(),
    });

    console.log('Team data migration completed successfully!');

  } catch (error) {
    // Log error
    if (MigrationLog) {
      await MigrationLog.create({
        step: 'error',
        status: 'failed',
        error,
        timestamp: new Date(),
      });
    }

    console.error('Migration failed:', error);
    throw error;
  } finally {
    if (db) {
      await mongoose.disconnect();
    }
  }
};

// Run migration if called directly
if (require.main === module) {
  migrateTeamData().catch(console.error);
} 