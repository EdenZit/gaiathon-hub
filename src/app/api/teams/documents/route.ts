import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Team } from '@/models/Team';
import { connectDB } from '@/lib/mongodb';
import { z } from 'zod';
import crypto from 'crypto';

interface SharedUser {
  userId: string;
  role: 'viewer' | 'editor' | 'owner';
}

interface TeamDocument {
  _id: string;
  title: string;
  content: string;
  format: 'text' | 'pdf' | 'doc' | 'sheet';
  createdBy: string;
  lastModified: Date;
  version: number;
  versions: {
    content: string;
    modifiedBy: string;
    modifiedAt: Date;
    version: number;
  }[];
  sharedWith?: SharedUser[];
  isEncrypted: boolean;
  encryptionKey?: string;
}

// Schema for document data validation
const documentSchema = z.object({
  title: z.string().min(1),
  content: z.string(),
  format: z.enum(['text', 'pdf', 'doc', 'sheet']),
  sharedWith: z.array(
    z.object({
      userId: z.string(),
      role: z.enum(['viewer', 'editor', 'owner']),
    })
  ).optional(),
  isEncrypted: z.boolean().optional(),
});

// Helper function to encrypt content if needed
function encryptContent(content: string, key: string) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-gcm', Buffer.from(key, 'hex'), iv);
  let encrypted = cipher.update(content, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag();
  return {
    content: encrypted,
    iv: iv.toString('hex'),
    authTag: authTag.toString('hex'),
  };
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const url = new URL(request.url);
    const documentId = url.searchParams.get('id');

    await connectDB();

    // Find the team where the user is a member
    const team = await Team.findOne({
      'members.userId': session.user.id,
    });

    if (!team) {
      return NextResponse.json(
        { error: 'Team not found' },
        { status: 404 }
      );
    }

    if (documentId) {
      // Get specific document
      const document = team.documents.id(documentId);
      if (!document) {
        return NextResponse.json(
          { error: 'Document not found' },
          { status: 404 }
        );
      }

      // Check if user has access to the document
      const hasAccess = document.sharedWith?.some(
        (share: SharedUser) => share.userId.toString() === session.user.id
      ) || document.createdBy.toString() === session.user.id;

      if (!hasAccess) {
        return NextResponse.json(
          { error: 'Not authorized to access this document' },
          { status: 403 }
        );
      }

      return NextResponse.json(document);
    }

    // Get all documents the user has access to
    const accessibleDocuments = team.documents.filter((doc: TeamDocument) => {
      return (
        doc.createdBy.toString() === session.user.id ||
        doc.sharedWith?.some((share: SharedUser) => share.userId.toString() === session.user.id)
      );
    });

    return NextResponse.json(accessibleDocuments);
  } catch (error) {
    console.error('Error fetching documents:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    // Find the team where the user is a member
    const team = await Team.findOne({
      'members.userId': session.user.id,
    });

    if (!team) {
      return NextResponse.json(
        { error: 'Team not found' },
        { status: 404 }
      );
    }

    // Check if user has permission to create documents
    const member = team.members.find(
      (m: { userId: string; permissions: { canManageDocuments: boolean } }) => 
        m.userId.toString() === session.user.id
    );
    if (!member?.permissions.canManageDocuments) {
      return NextResponse.json(
        { error: 'Not authorized to create documents' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validatedData = documentSchema.parse(body);

    // Handle encryption if needed
    let documentContent = validatedData.content;
    let encryptionData = null;

    if (validatedData.isEncrypted) {
      const encryptionKey = crypto.randomBytes(32).toString('hex');
      encryptionData = encryptContent(validatedData.content, encryptionKey);
      documentContent = JSON.stringify(encryptionData);
    }

    // Create new document
    const newDocument = {
      title: validatedData.title,
      content: documentContent,
      format: validatedData.format,
      createdBy: session.user.id,
      lastModified: new Date(),
      version: 1,
      versions: [{
        content: documentContent,
        modifiedBy: session.user.id,
        modifiedAt: new Date(),
        version: 1,
      }],
      sharedWith: validatedData.sharedWith || [],
      isEncrypted: validatedData.isEncrypted || false,
      encryptionKey: validatedData.isEncrypted ? encryptionData?.authTag : undefined,
    };

    team.documents.push(newDocument);

    // Add activity log
    team.activity.unshift({
      type: 'document',
      action: `Created document "${validatedData.title}"`,
      details: {
        user: {
          name: session.user.name || '',
          id: session.user.id,
        },
        title: validatedData.title,
      },
      timestamp: new Date(),
    });

    await team.save();

    return NextResponse.json({
      message: 'Document created successfully',
      document: newDocument,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid document data', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error creating document:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const url = new URL(request.url);
    const documentId = url.searchParams.get('id');

    if (!documentId) {
      return NextResponse.json(
        { error: 'Document ID is required' },
        { status: 400 }
      );
    }

    await connectDB();

    // Find the team where the user is a member
    const team = await Team.findOne({
      'members.userId': session.user.id,
    });

    if (!team) {
      return NextResponse.json(
        { error: 'Team not found' },
        { status: 404 }
      );
    }

    const document = team.documents.id(documentId);
    if (!document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    // Check if user has edit access
    const hasEditAccess = 
      document.createdBy.toString() === session.user.id ||
      document.sharedWith?.some(
        (share: SharedUser) => 
          share.userId.toString() === session.user.id && 
          ['editor', 'owner'].includes(share.role)
      );

    if (!hasEditAccess) {
      return NextResponse.json(
        { error: 'Not authorized to edit this document' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validatedData = documentSchema.parse(body);

    // Handle encryption if needed
    let documentContent = validatedData.content;
    let encryptionData = null;

    if (validatedData.isEncrypted) {
      const encryptionKey = crypto.randomBytes(32).toString('hex');
      encryptionData = encryptContent(validatedData.content, encryptionKey);
      documentContent = JSON.stringify(encryptionData);
    }

    // Update document
    document.title = validatedData.title;
    document.content = documentContent;
    document.format = validatedData.format;
    document.lastModified = new Date();
    document.version += 1;
    document.versions.push({
      content: documentContent,
      modifiedBy: session.user.id,
      modifiedAt: new Date(),
      version: document.version,
    });
    
    if (validatedData.sharedWith) {
      document.sharedWith = validatedData.sharedWith;
    }

    if (validatedData.isEncrypted !== undefined) {
      document.isEncrypted = validatedData.isEncrypted;
      if (validatedData.isEncrypted) {
        document.encryptionKey = encryptionData?.authTag;
      }
    }

    // Add activity log
    team.activity.unshift({
      type: 'document',
      action: `Updated document "${validatedData.title}"`,
      details: {
        user: {
          name: session.user.name || '',
          id: session.user.id,
        },
        title: validatedData.title,
      },
      timestamp: new Date(),
    });

    await team.save();

    return NextResponse.json({
      message: 'Document updated successfully',
      document,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid document data', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error updating document:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const url = new URL(request.url);
    const documentId = url.searchParams.get('id');

    if (!documentId) {
      return NextResponse.json(
        { error: 'Document ID is required' },
        { status: 400 }
      );
    }

    await connectDB();

    // Find the team where the user is a member
    const team = await Team.findOne({
      'members.userId': session.user.id,
    });

    if (!team) {
      return NextResponse.json(
        { error: 'Team not found' },
        { status: 404 }
      );
    }

    const document = team.documents.id(documentId);
    if (!document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    // Check if user has delete access (must be owner or creator)
    const hasDeleteAccess = 
      document.createdBy.toString() === session.user.id ||
      document.sharedWith?.some(
        (share: SharedUser) => 
          share.userId.toString() === session.user.id && 
          share.role === 'owner'
      );

    if (!hasDeleteAccess) {
      return NextResponse.json(
        { error: 'Not authorized to delete this document' },
        { status: 403 }
      );
    }

    // Remove document
    document.remove();

    // Add activity log
    team.activity.unshift({
      type: 'document',
      action: `Deleted document "${document.title}"`,
      details: {
        user: {
          name: session.user.name || '',
          id: session.user.id,
        },
        title: document.title,
      },
      timestamp: new Date(),
    });

    await team.save();

    return NextResponse.json({
      message: 'Document deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting document:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 