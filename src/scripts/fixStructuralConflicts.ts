import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

interface StructureFix {
  type: 'rename' | 'move' | 'create';
  from?: string;
  to?: string;
  path?: string;
  subDirs?: string[];
  files?: string[];
  merge?: boolean;
}

const STRUCTURE_FIXES: StructureFix[] = [
  // API Routes standardization
  {
    type: 'rename',
    from: 'src/app/api/team',
    to: 'src/app/api/teams',
  },
  {
    type: 'rename',
    from: 'src/app/api/user',
    to: 'src/app/api/users',
    merge: true,
  },
  
  // Component organization
  {
    type: 'move',
    from: 'src/components/team-workspace',
    to: 'src/components/teams',
    subDirs: ['workspace', 'members', 'chat', 'documents'],
  },
  {
    type: 'move',
    from: 'src/components/eo-tools',
    to: 'src/components/tools/earth-observation',
  },
  {
    type: 'move',
    from: 'src/components/ai-assistant',
    to: 'src/components/ai',
  },

  // Integration structure
  {
    type: 'create',
    path: 'src/lib/integrations',
    subDirs: ['google-drive', 'socket', 'ai'],
  },
  {
    type: 'create',
    path: 'src/app/api/integrations',
    subDirs: ['google-drive', 'socket', 'ai'],
  },

  // Model and type organization
  {
    type: 'create',
    path: 'src/models',
    files: ['Team.ts', 'TeamMember.ts', 'TeamInvite.ts'],
  },
  {
    type: 'create',
    path: 'src/types',
    files: ['team.d.ts', 'workspace.d.ts', 'collaboration.d.ts'],
  },
];

function createDirectoryIfNotExists(dir: string) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`Created directory: ${dir}`);
  }
}

function moveDirectory(from: string, to: string, subDirs: string[] = []) {
  if (fs.existsSync(from)) {
    createDirectoryIfNotExists(to);
    
    // Create subdirectories if specified
    subDirs.forEach(subDir => {
      createDirectoryIfNotExists(path.join(to, subDir));
    });

    try {
      // Try using git mv first
      execSync(`git mv ${from}/* ${to}/`, { stdio: 'inherit' });
    } catch (error) {
      console.log('Falling back to regular move...');
      const files = fs.readdirSync(from);
      files.forEach(file => {
        const sourcePath = path.join(from, file);
        const targetPath = path.join(to, file);
        fs.renameSync(sourcePath, targetPath);
      });
    }
    
    // Remove empty source directory
    if (fs.existsSync(from) && fs.readdirSync(from).length === 0) {
      fs.rmdirSync(from);
    }
  }
}

async function fixStructure() {
  console.log('Starting structural fixes...');

  for (const fix of STRUCTURE_FIXES) {
    try {
      switch (fix.type) {
        case 'rename':
          if (fix.from && fix.to && fs.existsSync(fix.from)) {
            if (fix.merge && fs.existsSync(fix.to)) {
              // Merge contents instead of rename
              moveDirectory(fix.from, fix.to);
            } else {
              fs.renameSync(fix.from, fix.to);
            }
            console.log(`Renamed: ${fix.from} → ${fix.to}`);
          }
          break;

        case 'move':
          if (fix.from && fix.to) {
            moveDirectory(fix.from, fix.to, fix.subDirs || []);
            console.log(`Moved: ${fix.from} → ${fix.to}`);
          }
          break;

        case 'create':
          if (fix.path) {
            createDirectoryIfNotExists(fix.path);
            if (fix.subDirs) {
              fix.subDirs.forEach(subDir => {
                createDirectoryIfNotExists(path.join(fix.path!, subDir));
              });
            }
            if (fix.files) {
              fix.files.forEach(file => {
                const filePath = path.join(fix.path!, file);
                if (!fs.existsSync(filePath)) {
                  fs.writeFileSync(filePath, '// TODO: Add implementation\n');
                }
              });
            }
            console.log(`Created structure: ${fix.path}`);
          }
          break;
      }
    } catch (error) {
      console.error(`Error processing ${fix.type}:`, error);
    }
  }

  console.log('\nStructural fixes complete!');
  console.log('\nNext steps:');
  console.log('1. Update import statements in your code');
  console.log('2. Test the new structure');
  console.log('3. Commit changes to version control');
}

// Run fixes
if (require.main === module) {
  fixStructure().catch(console.error);
} 