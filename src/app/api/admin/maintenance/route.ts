import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// Helper function to update the .env.production file
async function updateMaintenanceMode(enable: boolean): Promise<boolean> {
  try {
    // Get the path to the .env.production file
    const envFilePath = path.resolve(process.cwd(), '.env.production');
    
    // Check if the file exists and is accessible
    if (!fs.existsSync(envFilePath)) {
      console.error('Error: .env.production file not found');
      return false;
    }
    
    // Read the current content of the file
    let envContent = fs.readFileSync(envFilePath, 'utf8');
    
    // Replace the MAINTENANCE_MODE value
    const currentValue = enable ? 'false' : 'true';
    const newValue = enable ? 'true' : 'false';
    const regex = new RegExp(`MAINTENANCE_MODE=${currentValue}`, 'g');
    
    // Check if the value exists and needs to be changed
    if (!regex.test(envContent)) {
      // If the regex doesn't match, try to find the MAINTENANCE_MODE line anyway
      const maintenanceModeRegex = /MAINTENANCE_MODE=(true|false)/;
      if (maintenanceModeRegex.test(envContent)) {
        // Replace whatever value is there
        envContent = envContent.replace(maintenanceModeRegex, `MAINTENANCE_MODE=${newValue}`);
      } else {
        // If MAINTENANCE_MODE doesn't exist, add it
        envContent += `\nMAINTENANCE_MODE=${newValue}`;
      }
    } else {
      // Update the content with the regex we already tested
      envContent = envContent.replace(regex, `MAINTENANCE_MODE=${newValue}`);
    }
    
    // Write the updated content back to the file
    fs.writeFileSync(envFilePath, envContent, 'utf8');
    
    // Restart the web container to apply changes
    if (process.env.NODE_ENV === 'production') {
      try {
        await execAsync('docker-compose restart web');
      } catch (execError) {
        console.error('Error restarting web container:', execError);
        // Even if restart fails, we still updated the file, so return true
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error updating maintenance mode:', error);
    return false;
  }
}

// GET endpoint to check current maintenance mode status
export async function GET() {
  // Check if user is authenticated and is an admin
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    // First check the environment variable
    const envMaintenanceMode = process.env.MAINTENANCE_MODE === 'true';
    
    // Then try to read from the file as a backup
    try {
      const envFilePath = path.resolve(process.cwd(), '.env.production');
      if (fs.existsSync(envFilePath)) {
        const envContent = fs.readFileSync(envFilePath, 'utf8');
        const match = envContent.match(/MAINTENANCE_MODE=(true|false)/);
        const fileMaintenanceMode = match ? match[1] === 'true' : false;
        
        // Return the file value if it exists
        return NextResponse.json({ maintenanceMode: fileMaintenanceMode });
      }
    } catch (fileError) {
      console.error('Error reading from .env.production:', fileError);
      // Fall back to the environment variable
    }
    
    // Return the environment variable value as fallback
    return NextResponse.json({ maintenanceMode: envMaintenanceMode });
  } catch (error) {
    console.error('Error checking maintenance mode:', error);
    return NextResponse.json({ error: 'Failed to check maintenance mode' }, { status: 500 });
  }
}

// POST endpoint to toggle maintenance mode
export async function POST(request: Request) {
  // Check if user is authenticated and is an admin
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    // Parse the request body
    const { enable } = await request.json();
    
    // Validate the input
    if (typeof enable !== 'boolean') {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }
    
    // Update the maintenance mode
    const success = await updateMaintenanceMode(enable);
    
    if (!success) {
      // If file update failed, try to update just the environment variable
      // This won't persist after restart but at least provides some functionality
      process.env.MAINTENANCE_MODE = enable ? 'true' : 'false';
      
      return NextResponse.json({ 
        success: true, 
        warning: 'Could not update .env.production file. Changes will not persist after server restart.',
        message: enable ? 'Maintenance mode temporarily enabled' : 'Maintenance mode temporarily disabled',
        maintenanceMode: enable
      });
    }
    
    return NextResponse.json({ 
      success: true, 
      message: enable ? 'Maintenance mode enabled' : 'Maintenance mode disabled',
      maintenanceMode: enable
    });
  } catch (error) {
    console.error('Error toggling maintenance mode:', error);
    return NextResponse.json({ error: 'Failed to toggle maintenance mode' }, { status: 500 });
  }
} 