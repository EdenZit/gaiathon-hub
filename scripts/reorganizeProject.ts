import fs from 'fs';
import path from 'path';

const ROOT_DIR = process.cwd();
const SRC_DIR = path.join(ROOT_DIR, 'src');

interface FileMove {
  from: string;
  to: string;
}

const moves: FileMove[] = [
  // 1. Team Workspace Consolidation
  {
    from: 'src/app/team-workspace',
    to: 'src/app/resources/team-workspace'
  },

  // 2. Tools Organization
  {
    from: 'src/app/dashboard/tools',
    to: 'src/app/resources/tools'
  },

  // 3. Collaboration Features Consolidation
  {
    from: 'src/app/dashboard/collaboration',
    to: 'src/app/resources/team-workspace/collaboration'
  },

  // 4. Project Management Consolidation
  {
    from: 'src/app/dashboard/projects',
    to: 'src/app/resources/team-workspace/projects'
  },

  // 5. Component Deduplication
  {
    from: 'src/components/Features.tsx',
    to: 'src/components/home/Features.tsx'
  },
  {
    from: 'src/components/Hero.tsx',
    to: 'src/components/home/Hero.tsx'
  },

  // 6. API Route Organization
  {
    from: 'src/app/api/profile',
    to: 'src/app/api/user/profile'
  }
];

async function moveFile(from: string, to: string) {
  const sourcePath = path.join(ROOT_DIR, from);
  const targetPath = path.join(ROOT_DIR, to);

  // Check if source exists
  if (!fs.existsSync(sourcePath)) {
    console.log(`⚠️  Source not found: ${from}`);
    return;
  }

  // Create target directory if it doesn't exist
  const targetDir = path.dirname(targetPath);
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  try {
    // Move the file/directory
    if (fs.lstatSync(sourcePath).isDirectory()) {
      // For directories, copy recursively then delete source
      fs.cpSync(sourcePath, targetPath, { recursive: true });
      fs.rmSync(sourcePath, { recursive: true });
    } else {
      // For files, rename (move)
      fs.renameSync(sourcePath, targetPath);
    }
    console.log(`✓ Moved: ${from} -> ${to}`);
  } catch (error) {
    if (error instanceof Error) {
      console.error(`✗ Error moving ${from}: ${error.message}`);
    }
  }
}

async function reorganizeProject() {
  console.log('\n🔄 Starting project reorganization...\n');

  // Perform all moves
  for (const move of moves) {
    await moveFile(move.from, move.to);
  }

  // Clean up empty directories
  console.log('\n🧹 Cleaning up empty directories...');
  const dirsToCheck = [
    'src/app/team-workspace',
    'src/app/dashboard/tools',
    'src/app/dashboard/collaboration',
    'src/app/dashboard/projects'
  ];

  for (const dir of dirsToCheck) {
    const dirPath = path.join(ROOT_DIR, dir);
    if (fs.existsSync(dirPath)) {
      try {
        fs.rmdirSync(dirPath);
        console.log(`✓ Removed empty directory: ${dir}`);
      } catch (error) {
        if (error instanceof Error) {
          console.log(`⚠️  Could not remove ${dir}: ${error.message}`);
        }
      }
    }
  }

  console.log('\n✨ Project reorganization completed!\n');
}

// Add warning prompt
console.log('\n⚠️  WARNING: This will reorganize your project structure!');
console.log('Make sure you have committed your changes before proceeding.');
console.log('Are you sure you want to continue? (y/n)');

process.stdin.once('data', async (data) => {
  const input = data.toString().trim().toLowerCase();
  if (input === 'y') {
    await reorganizeProject();
    process.exit(0);
  } else {
    console.log('Operation cancelled');
    process.exit(0);
  }
}); 