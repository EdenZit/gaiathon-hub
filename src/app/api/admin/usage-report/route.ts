import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { generateUsageReport } from '@/lib/services/token-service';

// List of admin user IDs
const ADMIN_IDS = ['admin1', 'admin2']; // Replace with actual admin IDs

export async function GET() {
  try {
    // Check authentication
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user is admin
    if (!ADMIN_IDS.includes(session.user.id)) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    // Generate report
    const report = await generateUsageReport();

    return NextResponse.json(report);
  } catch (error) {
    console.error('Error generating usage report:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 