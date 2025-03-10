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
    
    // Read the current content of the file
    let envContent = fs.readFileSync(envFilePath, 'utf8');
    
    // Replace the MAINTENANCE_MODE value
    const currentValue = enable ? 'false' : 'true';
    const newValue = enable ? 'true' : 'false';
    const regex = new RegExp(`MAINTENANCE_MODE=${currentValue}`, 'g');
    
    // Check if the value exists and needs to be changed
    if (!regex.test(envContent)) {
      return false;
    }
    
    // Update the content
    envContent = envContent.replace(regex, `MAINTENANCE_MODE=${newValue}`);
    
    // Write the updated content back to the file
    fs.writeFileSync(envFilePath, envContent, 'utf8');
    
    // Restart the web container to apply changes
    if (process.env.NODE_ENV === 'production') {
      await execAsync('docker-compose restart web');
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
    // Get the path to the .env.production file
    const envFilePath = path.resolve(process.cwd(), '.env.production');
    
    // Read the current content of the file
    const envContent = fs.readFileSync(envFilePath, 'utf8');
    
    // Extract the MAINTENANCE_MODE value
    const match = envContent.match(/MAINTENANCE_MODE=(true|false)/);
    const maintenanceMode = match ? match[1] === 'true' : false;
    
    return NextResponse.json({ maintenanceMode });
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
      return NextResponse.json({ error: 'Failed to update maintenance mode' }, { status: 500 });
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