import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { connectDB } from '@/lib/mongodb';
import mongoose from 'mongoose';

const ITEMS_PER_PAGE = 10;

export async function GET(request: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    
    if (!mongoose.connection.db) {
      throw new Error('Database connection not established');
    }

    const { searchParams } = new URL(request.url);
    const collection = searchParams.get('collection');
    const page = parseInt(searchParams.get('page') || '1');
    const sortField = searchParams.get('sortField') || '_id';
    const sortOrder = searchParams.get('sortOrder') || 'asc';
    const search = searchParams.get('search') || '';

    if (!collection) {
      return NextResponse.json(
        { error: 'Collection name is required' },
        { status: 400 }
      );
    }

    // Build query
    let query = {};
    if (search) {
      // Create a text search query across all string fields
      const textSearchFields = await getTextSearchFields(collection);
      if (textSearchFields.length > 0) {
        query = {
          $or: textSearchFields.map((field) => ({
            [field]: { $regex: search, $options: 'i' }
          }))
        };
      }
    }

    const db = mongoose.connection.db;
    const totalRecords = await db
      .collection(collection)
      .countDocuments(query);

    const totalPages = Math.ceil(totalRecords / ITEMS_PER_PAGE);

    const records = await db
      .collection(collection)
      .find(query)
      .sort({ [sortField]: sortOrder === 'asc' ? 1 : -1 })
      .skip((page - 1) * ITEMS_PER_PAGE)
      .limit(ITEMS_PER_PAGE)
      .toArray();

    return NextResponse.json({
      records: records.map(record => ({
        ...record,
        _id: record._id.toString()
      })),
      page,
      totalPages,
      totalRecords
    });
  } catch (error) {
    console.error('Error fetching records:', error);
    return NextResponse.json(
      { error: 'Failed to fetch records' },
      { status: 500 }
    );
  }
}

// Helper function to get fields that can be used for text search
async function getTextSearchFields(collectionName: string) {
  if (!mongoose.connection.db) {
    throw new Error('Database connection not established');
  }

  const sample = await mongoose.connection.db
    .collection(collectionName)
    .findOne({});

  if (!sample) return [];

  return Object.entries(sample)
    .filter(([_, value]) => typeof value === 'string')
    .map(([key]) => key);
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    
    if (!mongoose.connection.db) {
      throw new Error('Database connection not established');
    }

    const id = request.url.split('/').pop();
    const { collection } = await request.json();

    if (!id || !collection) {
      return NextResponse.json(
        { error: 'Record ID and collection name are required' },
        { status: 400 }
      );
    }

    const result = await mongoose.connection.db
      .collection(collection)
      .deleteOne({ _id: new mongoose.Types.ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Record not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting record:', error);
    return NextResponse.json(
      { error: 'Failed to delete record' },
      { status: 500 }
    );
  }
} 