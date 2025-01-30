import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { connectDB } from '@/lib/mongodb';
import mongoose from 'mongoose';

export async function GET() {
  try {
    const session = await getServerSession();
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    
    if (!mongoose.connection.db) {
      throw new Error('Database connection not established');
    }

    // Get all collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    
    // Get count for each collection
    const collectionsWithCount = await Promise.all(
      collections.map(async (collection) => {
        const count = await mongoose.connection.db!
          .collection(collection.name)
          .countDocuments();
        
        return {
          name: collection.name,
          count
        };
      })
    );

    return NextResponse.json(collectionsWithCount);
  } catch (error) {
    console.error('Error fetching collections:', error);
    return NextResponse.json(
      { error: 'Failed to fetch collections' },
      { status: 500 }
    );
  }
} 