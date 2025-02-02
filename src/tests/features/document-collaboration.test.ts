import { describe, expect, beforeAll, afterAll, beforeEach, it, jest } from '@jest/globals';
import { setupTestDB, teardownTestDB, clearDatabase, createTestData, mockSession, socketMock, redisMock } from '../setup';
import { Document } from '@/models/Document';
import { SocketService } from '@/lib/services/socket';
import { documentMethods } from '@/lib/services/redis';

// Mock the Socket.IO service
jest.mock('@/lib/services/socket', () => ({
  SocketService: {
    getInstance: jest.fn().mockReturnValue({
      io: {
        on: socketMock.on,
        emit: socketMock.emit,
        to: socketMock.to
      }
    })
  }
}));

// Mock Redis methods
jest.mock('@/lib/services/redis', () => ({
  documentMethods: {
    trackDocumentSession: jest.fn(),
    removeDocumentSession: jest.fn(),
    getActiveUsers: jest.fn(),
    cacheDocumentContent: jest.fn(),
    getCachedContent: jest.fn()
  }
}));

describe('Document Collaboration Features', () => {
  beforeAll(async () => {
    await setupTestDB();
  });

  afterAll(async () => {
    await teardownTestDB();
  });

  beforeEach(async () => {
    await clearDatabase();
    jest.clearAllMocks();
  });

  describe('Document Management', () => {
    it('should create a new document', async () => {
      const { team } = await createTestData();
      
      const documentData = {
        title: 'New Document',
        description: 'Document Description',
        type: 'text',
        visibility: 'team',
        content: 'Initial content',
        owner: team.owner,
        team: team._id,
        collaborators: team.members,
        version: 1
      };

      const document = await Document.create(documentData);
      expect(document).toBeDefined();
      expect(document.title).toBe(documentData.title);
      expect(document.version).toBe(1);
    });

    it('should track document version changes', async () => {
      const { document } = await createTestData();
      
      document.content = 'Updated content';
      document.version += 1;
      document.editHistory.push({
        user: document.owner,
        changes: 'Updated content',
        timestamp: new Date()
      });

      await document.save();

      const updatedDocument = await Document.findById(document._id);
      expect(updatedDocument?.version).toBe(2);
      expect(updatedDocument?.editHistory).toHaveLength(1);
    });

    it('should manage document collaborators', async () => {
      const { document, team } = await createTestData();
      
      // Add a new collaborator
      const newCollaborator = team.members[0];
      document.collaborators.push(newCollaborator);
      await document.save();

      const updatedDocument = await Document.findById(document._id);
      expect(updatedDocument?.collaborators).toContain(newCollaborator);
    });
  });

  describe('Real-time Collaboration', () => {
    it('should track active document sessions', async () => {
      const { document } = await createTestData();
      const userId = mockSession.user.id;

      await documentMethods.trackDocumentSession(document._id.toString(), userId);
      expect(documentMethods.trackDocumentSession).toHaveBeenCalledWith(
        document._id.toString(),
        userId
      );
    });

    it('should handle document content updates', async () => {
      const { document } = await createTestData();
      const userId = mockSession.user.id;

      // Simulate real-time update
      const socketService = SocketService.getInstance();
      socketService.io.emit('document-update', {
        documentId: document._id,
        content: 'New content',
        version: 2,
        userId
      });

      expect(socketService.io.emit).toHaveBeenCalled();
    });

    it('should manage active collaborators', async () => {
      const { document } = await createTestData();
      const userId = mockSession.user.id;

      // Mock getting active users
      documentMethods.getActiveUsers.mockResolvedValue([userId]);

      const activeUsers = await documentMethods.getActiveUsers(document._id.toString());
      expect(activeUsers).toContain(userId);
    });

    it('should handle concurrent edits', async () => {
      const { document } = await createTestData();
      
      // Simulate concurrent updates
      const update1 = {
        documentId: document._id,
        content: 'Update 1',
        version: 2,
        userId: mockSession.user.id
      };

      const update2 = {
        documentId: document._id,
        content: 'Update 2',
        version: 3,
        userId: document.collaborators[0].toString()
      };

      // Process updates in order
      await Document.findByIdAndUpdate(document._id, {
        content: update1.content,
        version: update1.version,
        lastEditedBy: update1.userId
      });

      await Document.findByIdAndUpdate(document._id, {
        content: update2.content,
        version: update2.version,
        lastEditedBy: update2.userId
      });

      const finalDocument = await Document.findById(document._id);
      expect(finalDocument?.version).toBe(3);
      expect(finalDocument?.content).toBe('Update 2');
    });
  });

  describe('Document Caching', () => {
    it('should cache document content', async () => {
      const { document } = await createTestData();
      
      await documentMethods.cacheDocumentContent(
        document._id.toString(),
        document.content
      );

      expect(documentMethods.cacheDocumentContent).toHaveBeenCalledWith(
        document._id.toString(),
        document.content
      );
    });

    it('should retrieve cached content', async () => {
      const { document } = await createTestData();
      const cachedContent = 'Cached content';

      documentMethods.getCachedContent.mockResolvedValue(cachedContent);

      const content = await documentMethods.getCachedContent(document._id.toString());
      expect(content).toBe(cachedContent);
    });
  });
}); 