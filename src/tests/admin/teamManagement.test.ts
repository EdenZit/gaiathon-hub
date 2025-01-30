import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Team } from '@/lib/db/models/Team';
import { User } from '@/lib/db/models/User';
import { createTestAdmin, createTestUser, createTestTeam, createTestRequest, mockSession } from '../utils/testUtils';
import { GET, POST } from '@/app/api/admin/teams/route';
import { PATCH as patchTeam, DELETE as deleteTeam } from '@/app/api/admin/teams/[id]/route';
import { POST as addMember, DELETE as removeMember } from '@/app/api/admin/teams/[id]/members/[memberId]/route';
import type { Session } from 'next-auth';

let adminUser: any;
let testUsers: any[] = [];
let testTeam: any;

describe('Admin Team Management', () => {
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
  });

  describe('GET /api/admin/teams', () => {
    it('should return unauthorized for non-admin users', async () => {
      mockSession({ 
        user: { 
          ...testUsers[0].toJSON(), 
          role: 'user',
          email: testUsers[0].email
        } 
      } as Session);
      
      const request = createTestRequest('/api/admin/teams');
      const response = await GET(request);
      expect(response.status).toBe(401);
    });

    it('should return list of teams for admin', async () => {
      mockSession({ 
        user: { 
          ...adminUser.toJSON(), 
          role: 'admin',
          email: adminUser.email
        } 
      } as Session);
      
      const request = createTestRequest('/api/admin/teams');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(Array.isArray(data.teams)).toBe(true);
      expect(data.teams.length).toBeGreaterThan(0);
      expect(data.teams[0].name).toBeDefined();
      expect(data.teams[0].leaderId).toBeDefined();
    });

    it('should support filtering teams by leader', async () => {
      mockSession({ 
        user: { 
          ...adminUser.toJSON(), 
          role: 'admin',
          email: adminUser.email
        } 
      } as Session);
      
      const request = createTestRequest(`/api/admin/teams?leaderId=${adminUser._id}`);
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.teams.every((team: any) => 
        team.leaderId.toString() === adminUser._id.toString()
      )).toBe(true);
    });
  });

  describe('Team Creation and Editing', () => {
    it('should create a new team', async () => {
      mockSession({ 
        user: { 
          ...adminUser.toJSON(), 
          role: 'admin',
          email: adminUser.email
        } 
      } as Session);
      
      const teamData = {
        name: 'New Test Team',
        description: 'Test team description',
        leaderId: testUsers[0]._id.toString(),
        members: [testUsers[0]._id.toString(), testUsers[1]._id.toString()]
      };

      const request = createTestRequest('/api/admin/teams', {
        method: 'POST',
        body: teamData
      });
      
      const response = await POST(request);
      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data.team.name).toBe(teamData.name);
      expect(data.team.description).toBe(teamData.description);
      expect(data.team.leaderId.toString()).toBe(teamData.leaderId);
      expect(data.team.members.length).toBe(teamData.members.length);
    });

    it('should update team details', async () => {
      mockSession({ 
        user: { 
          ...adminUser.toJSON(), 
          role: 'admin',
          email: adminUser.email
        } 
      } as Session);
      
      const updateData = {
        name: 'Updated Team Name',
        description: 'Updated description'
      };

      const request = createTestRequest(`/api/admin/teams/${testTeam._id}`, {
        method: 'PATCH',
        body: updateData
      });
      
      const response = await patchTeam(request, { params: { id: testTeam._id.toString() } });
      expect(response.status).toBe(200);
      
      const updatedTeam = await Team.findById(testTeam._id);
      expect(updatedTeam?.name).toBe(updateData.name);
      expect(updatedTeam?.description).toBe(updateData.description);
    });

    it('should delete a team', async () => {
      mockSession({ 
        user: { 
          ...adminUser.toJSON(), 
          role: 'admin',
          email: adminUser.email
        } 
      } as Session);

      const request = createTestRequest(`/api/admin/teams/${testTeam._id}`, {
        method: 'DELETE'
      });
      
      const response = await deleteTeam(request, { params: { id: testTeam._id.toString() } });
      expect(response.status).toBe(200);
      
      const deletedTeam = await Team.findById(testTeam._id);
      expect(deletedTeam).toBeNull();
    });
  });

  describe('Team Member Management', () => {
    it('should add members to a team', async () => {
      mockSession({ 
        user: { 
          ...adminUser.toJSON(), 
          role: 'admin',
          email: adminUser.email
        } 
      } as Session);
      
      const memberToAdd = testUsers[0];
      const request = createTestRequest(`/api/admin/teams/${testTeam._id}/members/${memberToAdd._id}`, {
        method: 'POST'
      });
      
      const response = await addMember(request, { 
        params: { 
          id: testTeam._id.toString(),
          memberId: memberToAdd._id.toString()
        }
      });
      expect(response.status).toBe(200);
      
      const updatedTeam = await Team.findById(testTeam._id);
      expect(updatedTeam?.members.length).toBe(2); // Leader + new member
      expect(updatedTeam?.members.some(member => 
        member.user.toString() === memberToAdd._id.toString()
      )).toBe(true);
    });

    it('should remove a member from a team', async () => {
      mockSession({ 
        user: { 
          ...adminUser.toJSON(), 
          role: 'admin',
          email: adminUser.email
        } 
      } as Session);
      
      // First add a member
      const memberToRemove = testUsers[0];
      const addRequest = createTestRequest(`/api/admin/teams/${testTeam._id}/members/${memberToRemove._id}`, {
        method: 'POST'
      });
      
      await addMember(addRequest, { 
        params: { 
          id: testTeam._id.toString(),
          memberId: memberToRemove._id.toString()
        }
      });

      // Then remove the member
      const removeRequest = createTestRequest(`/api/admin/teams/${testTeam._id}/members/${memberToRemove._id}`, {
        method: 'DELETE'
      });
      
      const response = await removeMember(removeRequest, { 
        params: { 
          id: testTeam._id.toString(),
          memberId: memberToRemove._id.toString()
        }
      });
      expect(response.status).toBe(200);
      
      const updatedTeam = await Team.findById(testTeam._id);
      expect(updatedTeam?.members.some(member => 
        member.user.toString() === memberToRemove._id.toString()
      )).toBe(false);
    });

    it('should prevent removing the team leader', async () => {
      mockSession({ 
        user: { 
          ...adminUser.toJSON(), 
          role: 'admin',
          email: adminUser.email
        } 
      } as Session);

      // Get the leader member from the team
      const team = await Team.findById(testTeam._id);
      const leaderMember = team?.members.find(member => member.role === 'leader');
      if (!leaderMember) {
        throw new Error('Team leader not found');
      }

      const request = createTestRequest(`/api/admin/teams/${testTeam._id}/members/${leaderMember.user}`, {
        method: 'DELETE'
      });
      
      const response = await removeMember(request, { 
        params: { 
          id: testTeam._id.toString(),
          memberId: leaderMember.user.toString()
        }
      });
      expect(response.status).toBe(400);
      
      const updatedTeam = await Team.findById(testTeam._id);
      expect(updatedTeam?.members.some(member => 
        member.user.toString() === leaderMember.user.toString()
      )).toBe(true);
    });
  });
}); 