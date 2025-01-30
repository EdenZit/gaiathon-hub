import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Document } from '@/models/Document';
import type { IDocument } from '@/models/Document';
import { Team } from '@/lib/db/models/Team';
import { createTestAdmin, createTestUser, createTestTeam, createTestDocument, createTestRequest, mockSession } from '../utils/testUtils';
import { GET, POST } from '@/app/api/admin/documents/route';
import { PATCH as patchDocument, DELETE as deleteDocument } from '@/app/api/admin/documents/[id]/route';
import { POST as addCollaborator, DELETE as removeCollaborator } from '@/app/api/admin/documents/[id]/collaborators/[userId]/route';
import type { Session } from 'next-auth';
import mongoose from 'mongoose';

let adminUser: any;
let testUsers: any[] = [];
let testTeam: any;
let testDocument: any;

describe('Admin Document Management', () => {
  beforeEach(async () => {
    await connectDB();
    
    // Create admin user
    adminUser = await createTestAdmin();
    
    // Create test users
    testUsers = [];
    for (let i = 0; i < 3; i++) {
      const user = await createTestUser();
      testUsers.push(user);
    }
    
    // Create a test team
    testTeam = await createTestTeam(adminUser._id);
    
    // Create a test document
    testDocument = await createTestDocument(adminUser._id, testTeam._id);
  });

  describe('GET /api/admin/documents', () => {
    it('should return unauthorized for non-admin users', async () => {
      mockSession({ 
        user: { 
          ...testUsers[0].toJSON(), 
          role: 'user',
          email: testUsers[0].email
        } 
      } as Session);
      
      const request = createTestRequest('/api/admin/documents');
      const response = await GET(request);
      expect(response.status).toBe(401);
    });

    it('should return list of documents for admin', async () => {
      mockSession({ 
        user: { 
          ...adminUser.toJSON(), 
          role: 'admin',
          email: adminUser.email
        } 
      } as Session);
      
      const request = createTestRequest('/api/admin/documents');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(Array.isArray(data.documents)).toBe(true);
      expect(data.documents.length).toBeGreaterThan(0);
      expect(data.documents[0].title).toBeDefined();
      expect(data.documents[0].owner).toBeDefined();
    });

    it('should support filtering documents by team', async () => {
      mockSession({ 
        user: { 
          ...adminUser.toJSON(), 
          role: 'admin',
          email: adminUser.email
        } 
      } as Session);
      
      // Create documents for different teams
      const otherTeam = await createTestTeam(adminUser._id);
      
      await Document.create({
        title: 'Test Team Doc 1',
        description: 'Test document for team 1',
        type: 'text',
        visibility: 'team',
        content: 'Test content 1',
        owner: adminUser._id,
        team: testTeam._id,
        version: 1,
        lastModified: new Date()
      });

      await Document.create({
        title: 'Test Team Doc 2',
        description: 'Test document for team 2',
        type: 'text',
        visibility: 'team',
        content: 'Test content 2',
        owner: adminUser._id,
        team: otherTeam._id,
        version: 1,
        lastModified: new Date()
      });
      
      const request = createTestRequest(`/api/admin/documents?teamId=${testTeam._id}`);
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.documents.length).toBeGreaterThan(0);
      expect(data.documents.every((doc: any) => doc.team._id.toString() === testTeam._id.toString())).toBe(true);
    });

    it('should support filtering documents by owner', async () => {
      mockSession({ 
        user: { 
          ...adminUser.toJSON(), 
          role: 'admin',
          email: adminUser.email
        } 
      } as Session);
      
      // Create documents for different owners
      await Document.create({
        title: 'Admin Doc',
        description: 'Test document for admin',
        type: 'text',
        visibility: 'team',
        content: 'Admin content',
        owner: adminUser._id,
        team: testTeam._id,
        version: 1,
        lastModified: new Date()
      });

      await Document.create({
        title: 'User Doc',
        description: 'Test document for user',
        type: 'text',
        visibility: 'team',
        content: 'User content',
        owner: testUsers[0]._id,
        team: testTeam._id,
        version: 1,
        lastModified: new Date()
      });
      
      const request = createTestRequest(`/api/admin/documents?ownerId=${adminUser._id}`);
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.documents.length).toBeGreaterThan(0);
      expect(data.documents.every((doc: any) => doc.owner._id.toString() === adminUser._id.toString())).toBe(true);
    });
  });

  describe('Document Creation and Editing', () => {
    it('should create a new document', async () => {
      mockSession({ 
        user: { 
          ...adminUser.toJSON(), 
          role: 'admin',
          email: adminUser.email
        } 
      } as Session);
      
      const documentData = {
        title: 'New Test Document',
        description: 'Test document description',
        type: 'text',
        visibility: 'team',
        content: 'Test document content',
        owner: testUsers[0]._id.toString(),
        team: testTeam._id.toString(),
        collaborators: [testUsers[1]._id.toString()]
      };

      const request = createTestRequest('/api/admin/documents', {
        method: 'POST',
        body: documentData
      });
      
      const response = await POST(request);
      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data.document.title).toBe(documentData.title);
      expect(data.document.description).toBe(documentData.description);
      expect(data.document.owner._id.toString()).toBe(documentData.owner);
      expect(data.document.team._id.toString()).toBe(documentData.team);
      expect(data.document.collaborators.length).toBe(documentData.collaborators.length);
      expect(data.document.content).toBe(documentData.content);
    });

    it('should update an existing document', async () => {
      mockSession({ 
        user: { 
          ...adminUser.toJSON(), 
          role: 'admin',
          email: adminUser.email
        } 
      } as Session);

      // Create initial document
      const initialDoc = await Document.create({
        title: 'Test Document',
        description: 'Initial description',
        type: 'text',
        visibility: 'team',
        content: 'Initial content',
        owner: adminUser._id,
        team: testTeam._id,
        version: 1,
        lastModified: new Date()
      }) as mongoose.Document & IDocument;

      const updateData = {
        title: 'Updated Test Document',
        description: 'Updated description',
        type: 'text',
        visibility: 'team',
        teamId: testTeam._id.toString()
      };

      const request = createTestRequest(`/api/admin/documents/${initialDoc._id}`, {
        method: 'PATCH',
        body: updateData
      });

      const response = await patchDocument(request, { params: { id: initialDoc._id.toString() } });
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.document.title).toBe(updateData.title);
      expect(data.document.description).toBe(updateData.description);
      expect(data.document.team._id.toString()).toBe(updateData.teamId);
    });

    it('should delete a document', async () => {
      mockSession({ 
        user: { 
          ...adminUser.toJSON(), 
          role: 'admin',
          email: adminUser.email
        } 
      } as Session);

      const request = createTestRequest(`/api/admin/documents/${testDocument._id}`, {
        method: 'DELETE'
      });
      
      const response = await deleteDocument(request, { params: { id: testDocument._id.toString() } });
      expect(response.status).toBe(200);
      
      const deletedDocument = await Document.findById(testDocument._id);
      expect(deletedDocument).toBeNull();
    });
  });

  describe('Document Collaborator Management', () => {
    it('should add a collaborator to a document', async () => {
      mockSession({ 
        user: { 
          ...adminUser.toJSON(), 
          role: 'admin',
          email: adminUser.email
        } 
      } as Session);
      
      const collaboratorId = testUsers[0]._id.toString();
      const request = createTestRequest(`/api/admin/documents/${testDocument._id}/collaborators/${collaboratorId}`, {
        method: 'POST'
      });
      
      const response = await addCollaborator(request, { 
        params: { 
          id: testDocument._id.toString(),
          userId: collaboratorId
        } as { id: string; userId: string }
      });
      expect(response.status).toBe(200);
      
      const updatedDocument = await Document.findById(testDocument._id);
      expect(updatedDocument?.collaborators.some(id => 
        id.toString() === collaboratorId
      )).toBe(true);
    });

    it('should remove a collaborator from a document', async () => {
      mockSession({ 
        user: { 
          ...adminUser.toJSON(), 
          role: 'admin',
          email: adminUser.email
        } 
      } as Session);
      
      // First add a collaborator
      const collaboratorToRemove = testUsers[0];
      testDocument.collaborators.push(collaboratorToRemove._id);
      await testDocument.save();

      const request = createTestRequest(`/api/admin/documents/${testDocument._id}/collaborators/${collaboratorToRemove._id}`, {
        method: 'DELETE'
      });
      
      const response = await removeCollaborator(request, { 
        params: { 
          id: testDocument._id.toString(),
          userId: collaboratorToRemove._id.toString()
        } as { id: string; userId: string }
      });
      expect(response.status).toBe(200);
      
      const updatedDocument = await Document.findById(testDocument._id);
      expect(updatedDocument?.collaborators.some(id => 
        id.toString() === collaboratorToRemove._id.toString()
      )).toBe(false);
    });

    it('should prevent removing the document owner as collaborator', async () => {
      mockSession({ 
        user: { 
          ...adminUser.toJSON(), 
          role: 'admin',
          email: adminUser.email
        } 
      } as Session);

      const request = createTestRequest(`/api/admin/documents/${testDocument._id}/collaborators/${testDocument.owner}`, {
        method: 'DELETE'
      });
      
      const response = await removeCollaborator(request, { 
        params: { 
          id: testDocument._id.toString(),
          userId: testDocument.owner.toString()
        } as { id: string; userId: string }
      });
      expect(response.status).toBe(400);
    });
  });
}); 