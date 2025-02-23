import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { cleanDatabase, CollectionName } from '@/lib/utils/dbCleanup';
import { rateLimit } from '@/lib/rateLimit';

const limiter = rateLimit({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 500
});

export async function POST(req: NextRequest) {
  try {
    // Rate limiting
    try {
      await limiter.check(req, 3, 'CLEANUP_DB');
    } catch {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      );
    }

    // Verify admin authentication
    const token = await getToken({ req });
    if (!token || token.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { collections, preserveAdmins = true, dryRun = false } = body;

    // Validate collections
    if (!collections || !Array.isArray(collections) || collections.length === 0) {
      return NextResponse.json(
        { error: 'Invalid collections parameter' },
        { status: 400 }
      );
    }

    // Validate that all collection names are valid
    const validCollections: CollectionName[] = ['users', 'blogPosts', 'gallery', 'announcements', 'all'];
    const invalidCollections = collections.filter(c => !validCollections.includes(c as CollectionName));
    
    if (invalidCollections.length > 0) {
      return NextResponse.json(
        { error: `Invalid collection names: ${invalidCollections.join(', ')}` },
        { status: 400 }
      );
    }

    // Perform cleanup
    const result = await cleanDatabase(collections as CollectionName[], {
      preserveAdmins,
      dryRun
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('DB Cleanup API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    // Rate limiting
    try {
      await limiter.check(req, 5, 'CLEANUP_DB_CHECK');
    } catch {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      );
    }

    // Verify admin authentication
    const token = await getToken({ req });
    if (!token || token.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    // Get collection counts (dry run)
    const result = await cleanDatabase(['all'], { dryRun: true });
    return NextResponse.json(result);
  } catch (error) {
    console.error('DB Cleanup Check API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
} 