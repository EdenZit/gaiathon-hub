import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { connectDB } from '@/lib/mongodb';
import { Document } from '@/lib/db/models/Document';
import { User } from '@/lib/db/models/User';

const ITEMS_PER_PAGE = 10;

export async function GET(request: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const search = searchParams.get('search') || '';
    const type = searchParams.get('type');
    const visibility = searchParams.get('visibility');
    const teamId = searchParams.get('teamId');
    const ownerId = searchParams.get('ownerId');
    const limit = searchParams.get('limit');

    // Build query
    const query: any = {};
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    if (type && type !== 'all') query.type = type;
    if (visibility && visibility !== 'all') query.visibility = visibility;
    if (teamId) query.team = teamId;
    if (ownerId) query.owner = ownerId;

    // If limit=all, return all documents without pagination
    if (limit === 'all') {
      const documents = await Document
        .find(query)
        .sort({ updatedAt: -1 })
        .populate('owner', 'firstName lastName email')
        .populate('team', 'name')
        .populate('collaborators', 'firstName lastName email');

      return NextResponse.json({ documents });
    }

    const totalDocuments = await Document.countDocuments(query);
    const totalPages = Math.ceil(totalDocuments / ITEMS_PER_PAGE);

    const documents = await Document
      .find(query)
      .sort({ updatedAt: -1 })
      .skip((page - 1) * ITEMS_PER_PAGE)
      .limit(ITEMS_PER_PAGE)
      .populate('owner', 'firstName lastName email')
      .populate('team', 'name')
      .populate('collaborators', 'firstName lastName email');

    return NextResponse.json({
      documents,
      page,
      totalPages,
      totalDocuments
    });
  } catch (error) {
    console.error('Error fetching documents:', error);
    return NextResponse.json(
      { error: 'Failed to fetch documents' },
      { status: 500 }
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