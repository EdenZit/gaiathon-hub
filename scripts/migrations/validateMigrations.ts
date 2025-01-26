import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

interface ValidationResult {
  name: string;
  status: 'success' | 'failed';
  errors?: string[];
}

async function validateFileStructure(): Promise<ValidationResult> {
  const errors: string[] = [];
  const requiredPaths = [
    'src/components/teams',
    'src/components/tools/earth-observation',
    'src/components/ai',
    'src/lib/integrations',
    'src/app/api/teams',
    'src/app/api/integrations',
    'src/models',
    'src/types'
  ];

  for (const path of requiredPaths) {
    if (!fs.existsSync(path)) {
      errors.push(`Missing directory: ${path}`);
    }
  }

  return {
    name: 'File Structure',
    status: errors.length === 0 ? 'success' : 'failed',
    errors: errors.length > 0 ? errors : undefined
  };
}

async function validateDatabaseMigration(): Promise<ValidationResult> {
  const errors: string[] = [];

  try {
    const uri = process.env.DATABASE_URL;
    if (!uri) {
      throw new Error('DATABASE_URL environment variable is not set');
    }

    await mongoose.connect(uri);
    const db = mongoose.connection;

    // Check for old paths in teams collection
    const oldTeamPaths = await db.collection('teams').countDocuments({
      $or: [
        { resourcePath: { $exists: true } },
        { workspacePath: { $exists: true } }
      ]
    });

    if (oldTeamPaths > 0) {
      errors.push(`Found ${oldTeamPaths} teams with old path structure`);
    }

    // Check for old paths in files collection
    const oldFilePaths = await db.collection('files').countDocuments({
      path: /^\/resources\/team-workspace/
    });

    if (oldFilePaths > 0) {
      errors.push(`Found ${oldFilePaths} files with old path structure`);
    }

    // Check migration logs
    const migrationLogs = await db.collection('MigrationLog').find({
      status: 'failed'
    }).toArray();

    if (migrationLogs.length > 0) {
      errors.push(`Found ${migrationLogs.length} failed migration attempts`);
    }

  } catch (error: unknown) {
    if (error instanceof Error) {
      errors.push(`Database validation error: ${error.message}`);
    } else {
      errors.push(`Database validation error: ${String(error)}`);
    }
  } finally {
    await mongoose.disconnect();
  }

  return {
    name: 'Database Migration',
    status: errors.length === 0 ? 'success' : 'failed',
    errors: errors.length > 0 ? errors : undefined
  };
}

export async function validateMigrations() {
  console.log('Starting migration validation...');

  const validations = [
    await validateFileStructure(),
    await validateDatabaseMigration()
  ];

  console.log('\nValidation Results:');
  validations.forEach(validation => {
    console.log(`\n${validation.name}:`);
    console.log(`Status: ${validation.status}`);
    if (validation.errors) {
      console.log('Errors:');
      validation.errors.forEach(error => console.log(`- ${error}`));
    }
  });

  const hasErrors = validations.some(v => v.status === 'failed');
  if (hasErrors) {
    console.error('\nValidation failed! Please check the errors above.');
    process.exit(1);
  } else {
    console.log('\nAll validations passed successfully!');
  }
}

// Run validation if called directly
if (require.main === module) {
  validateMigrations().catch(console.error);
} 