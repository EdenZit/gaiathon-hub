import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { connectDB } from '@/lib/mongodb';
import { Document } from '@/models/Document';
import { AdminDocumentQuery, ApiError, PaginatedResponse } from '@/types/admin';
import { IDocument } from '@/types/models';

const ITEMS_PER_PAGE = 10;

export async function GET(request: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const query: AdminDocumentQuery = {
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || String(ITEMS_PER_PAGE)),
      search: searchParams.get('search') || undefined,
      type: (searchParams.get('type') as AdminDocumentQuery['type']) || 'all',
      visibility: (searchParams.get('visibility') as AdminDocumentQuery['visibility']) || 'all',
      team: searchParams.get('team') || undefined,
      owner: searchParams.get('owner') || undefined
    };

    // Build MongoDB query
    const mongoQuery: Record<string, unknown> = {};
    
    if (query.type && query.type !== 'all') {
      mongoQuery.type = query.type;
    }
    
    if (query.visibility && query.visibility !== 'all') {
      mongoQuery.visibility = query.visibility;
    }
    
    if (query.team) {
      mongoQuery.team = query.team;
    }
    
    if (query.owner) {
      mongoQuery.owner = query.owner;
    }
    
    if (query.search) {
      mongoQuery.$or = [
        { title: { $regex: query.search, $options: 'i' } },
        { description: { $regex: query.search, $options: 'i' } }
      ];
    }

    // Execute query with pagination
    const total = await Document.countDocuments(mongoQuery);
    const pages = Math.ceil(total / query.limit!);
    const skip = (query.page! - 1) * query.limit!;

    const documents = await Document.find(mongoQuery)
      .populate('owner team collaborators', 'firstName lastName email name')
      .skip(skip)
      .limit(query.limit!)
      .sort({ updatedAt: -1 });

    const response: PaginatedResponse<IDocument> = {
      data: documents,
      pagination: {
        page: query.page!,
        limit: query.limit!,
        total,
        pages
      }
    };

    return NextResponse.json(response);
  } catch (error) {
    const apiError = error as ApiError;
    console.error('Error fetching documents:', apiError);
    return NextResponse.json(
      { error: apiError.message || 'Failed to fetch documents' },
      { status: apiError.status || 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { title, description, type, visibility, team, content, owner, collaborators = [] } = body;

    if (!title || !description || !type || !visibility || !content) {
      return NextResponse.json(
        { error: 'Required fields are missing' },
        { status: 400 }
      );
    }

    await connectDB();

    // Check if document title already exists
    const existingDocument = await Document.findOne({ title });
    if (existingDocument) {
      return NextResponse.json(
        { error: 'Document with this title already exists' },
        { status: 400 }
      );
    }

    // Create new document
    const document = new Document({
      title,
      description,
      type,
      visibility,
      content,
      owner: owner || session.user.id,
      team: team,
      collaborators: collaborators,
      version: 1,
      lastModified: new Date()
    });

    await document.save();

    // Populate owner and team details for response
    await document.populate([
      { path: 'owner', select: 'firstName lastName email' },
      { path: 'team', select: 'name' },
      { path: 'collaborators', select: 'firstName lastName email' }
    ]);

    return NextResponse.json({ document });
  } catch (error) {
    console.error('Error creating document:', error);
    return NextResponse.json(
      { error: 'Failed to create document' },
      { status: 500 }
    );
  }
} 