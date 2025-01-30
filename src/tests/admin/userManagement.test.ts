import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { User } from '@/lib/db/models/User';
import { createTestAdmin, createTestUser, mockSession } from '../utils/testUtils';
import { GET, POST } from '@/app/api/admin/users/route';
import { PATCH as patchRole } from '@/app/api/admin/users/[id]/role/route';
import { PATCH as patchStatus } from '@/app/api/admin/users/[id]/status/route';
import { POST as bulkAction } from '@/app/api/admin/users/bulk/route';
import mongoose from 'mongoose';
import type { Session } from 'next-auth';

let adminUser: any;
let testUsers: any[] = [];
let userCounter = 0;

function createRequest(url: string, options: { method?: string; body?: any } = {}) {
  const request = new NextRequest(new URL(url, 'http://localhost:3000'), {
    method: options.method || 'GET',
    ...(options.body && {
      body: JSON.stringify(options.body),
      headers: {
        'Content-Type': 'application/json'
      }
    })
  });
  return request;
}

describe('Admin User Management', () => {
  beforeEach(async () => {
    await connectDB();
    
    // Create admin user
    adminUser = await createTestAdmin();
    
    // Create test users
    testUsers = [];
    for (let i = 0; i < 5; i++) {
      userCounter++;
      const user = await createTestUser();
      testUsers.push(user);
    }
  });

  describe('GET /api/admin/users', () => {
    it('should return unauthorized for non-admin users', async () => {
      const regularUser = await createTestUser();
      mockSession({ 
        user: { 
          ...regularUser.toJSON(), 
          role: 'user',
          email: regularUser.email
        } 
      } as Session);
      
      const request = createRequest('/api/admin/users');
      const response = await GET(request);
      expect(response.status).toBe(401);
    });

    it('should return paginated users list for admin', async () => {
      mockSession({ 
        user: { 
          ...adminUser.toJSON(), 
          role: 'admin',
          email: adminUser.email
        } 
      } as Session);
      
      const request = createRequest('/api/admin/users?page=1');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.users).toBeDefined();
      expect(Array.isArray(data.users)).toBe(true);
      expect(data.totalPages).toBeDefined();
      expect(data.page).toBe(1);
    });

    it('should filter users by role', async () => {
      mockSession({ 
        user: { 
          ...adminUser.toJSON(), 
          role: 'admin',
          email: adminUser.email
        } 
      } as Session);
      
      const request = createRequest('/api/admin/users?role=user');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.users.every((user: any) => user.role === 'user')).toBe(true);
    });

    it('should search users by name or email', async () => {
      mockSession({ 
        user: { 
          ...adminUser.toJSON(), 
          role: 'admin',
          email: adminUser.email
        } 
      } as Session);
      
      const searchTerm = testUsers[0].email;
      const request = createRequest(`/api/admin/users?search=${searchTerm}`);
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.users.some((user: any) => user.email === searchTerm)).toBe(true);
    });
  });

  describe('User Role Management', () => {
    it('should update user role', async () => {
      mockSession({ 
        user: { 
          ...adminUser.toJSON(), 
          role: 'admin',
          email: adminUser.email
        } 
      } as Session);
      
      const targetUser = testUsers[0];
      const request = createRequest(`/api/admin/users/${targetUser._id}/role`, {
        method: 'PATCH',
        body: { role: 'admin' }
      });
      
      const response = await patchRole(request, { params: { id: targetUser._id.toString() } });
      expect(response.status).toBe(200);

      const updatedUser = await User.findById(targetUser._id);
      expect(updatedUser?.role).toBe('admin');
    });

    it('should prevent removing the last admin', async () => {
      mockSession({ 
        user: { 
          ...adminUser.toJSON(), 
          role: 'admin',
          email: adminUser.email
        } 
      } as Session);
      
      const request = createRequest(`/api/admin/users/${adminUser._id}/role`, {
        method: 'PATCH',
        body: { role: 'user' }
      });
      
      const response = await patchRole(request, { params: { id: adminUser._id.toString() } });
      expect(response.status).toBe(400);
    });
  });

  describe('User Status Management', () => {
    it('should update user status', async () => {
      mockSession({ 
        user: { 
          ...adminUser.toJSON(), 
          role: 'admin',
          email: adminUser.email
        } 
      } as Session);
      
      const targetUser = testUsers[0];
      const request = createRequest(`/api/admin/users/${targetUser._id}/status`, {
        method: 'PATCH',
        body: { status: 'inactive' }
      });
      
      const response = await patchStatus(request, { params: { id: targetUser._id.toString() } });
      expect(response.status).toBe(200);

      const updatedUser = await User.findById(targetUser._id);
      expect(updatedUser?.status).toBe('inactive');
    });

    it('should prevent deactivating the last active admin', async () => {
      mockSession({ 
        user: { 
          ...adminUser.toJSON(), 
          role: 'admin',
          email: adminUser.email
        } 
      } as Session);
      
      const request = createRequest(`/api/admin/users/${adminUser._id}/status`, {
        method: 'PATCH',
        body: { status: 'inactive' }
      });
      
      const response = await patchStatus(request, { params: { id: adminUser._id.toString() } });
      expect(response.status).toBe(400);
    });
  });

  describe('Bulk Actions', () => {
    it('should perform bulk activation', async () => {
      mockSession({ 
        user: { 
          ...adminUser.toJSON(), 
          role: 'admin',
          email: adminUser.email
        } 
      } as Session);
      
      // First deactivate the users
      await User.updateMany(
        { _id: { $in: testUsers.slice(0, 3).map(user => user._id) } },
        { $set: { status: 'inactive' } }
      );
      
      const userIds = testUsers.slice(0, 3).map(user => user._id.toString());
      const request = createRequest('/api/admin/users/bulk', {
        method: 'POST',
        body: { userIds, action: 'activate' }
      });
      
      const response = await bulkAction(request);
      expect(response.status).toBe(200);

      const updatedUsers = await User.find({ _id: { $in: userIds } });
      expect(updatedUsers.every(user => user.status === 'active')).toBe(true);
    });

    it('should perform bulk deletion', async () => {
      mockSession({ 
        user: { 
          ...adminUser.toJSON(), 
          role: 'admin',
          email: adminUser.email
        } 
      } as Session);
      
      const userIds = testUsers.slice(0, 2).map(user => user._id.toString());
      const request = createRequest('/api/admin/users/bulk', {
        method: 'POST',
        body: { userIds, action: 'delete' }
      });
      
      const response = await bulkAction(request);
      expect(response.status).toBe(200);

      const remainingUsers = await User.find({ _id: { $in: userIds } });
      expect(remainingUsers.length).toBe(0);
    });

    it('should prevent bulk actions affecting all admins', async () => {
      mockSession({ 
        user: { 
          ...adminUser.toJSON(), 
          role: 'admin',
          email: adminUser.email
        } 
      } as Session);
      
      // Make some users admins
      await User.updateMany(
        { _id: { $in: testUsers.slice(0, 2).map(u => u._id) } },
        { role: 'admin' }
      );

      const userIds = [adminUser._id.toString(), ...testUsers.slice(0, 2).map(u => u._id.toString())];
      const request = createRequest('/api/admin/users/bulk', {
        method: 'POST',
        body: { userIds, action: 'deactivate' }
      });
      
      const response = await bulkAction(request);
      expect(response.status).toBe(400);
    });
  });
}); 