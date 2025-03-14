import { connectDB } from '@/lib/mongodb';
import { Team as TeamModel } from '@/lib/db/models/Team';
import { cache } from 'react';
import { Types } from 'mongoose';

export interface TeamMember {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  teamRole: 'leader' | 'member';
  institution?: string;
  country?: string;
}

export interface Team {
  _id: string;
  name: string;
  category: 'Digital Platforms and Interactive Applications' | 'IoT-Enabled Smart Systems' | 'Geospatial Intelligence and Policy Innovation';
  status: 'pending' | 'approved' | 'rejected';
  leaderId: string;
  leader: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    institution: string;
    country: string;
  } | null;
  members: Array<TeamMember & { joinedAt: string }>;
  createdAt: string;
}

export const getTeams = cache(async (): Promise<Team[]> => {
  try {
    await connectDB();
    
    console.log('Admin fetching teams - starting query');
    
    const teams = await TeamModel.find({})
      .populate('leaderId', 'firstName lastName email institution country')
      .populate('members.user', 'firstName lastName email institution country')
      .sort({ createdAt: -1 })
      .lean();
    
    console.log(`Admin fetching teams - found ${teams.length} teams`);
    
    // Log the raw team data for debugging
    teams.forEach((team, index) => {
      console.log(`Team ${index + 1}: ${team.name}, ID: ${team._id}, Status: ${team.status}`);
      console.log(`  Leader ID: ${team.leaderId?._id || 'undefined'}`);
      console.log(`  Members count: ${team.members?.length || 0}`);
    });

    return teams.map((team: any) => {
      try {
        return {
          _id: team._id.toString(),
          name: team.name || '',
          category: team.category || 'Digital Platforms and Interactive Applications',
          status: team.status || 'pending',
          leaderId: team.leaderId?._id?.toString(),
          leader: team.leaderId ? {
            _id: team.leaderId._id?.toString() || '',
            firstName: team.leaderId.firstName || '',
            lastName: team.leaderId.lastName || '',
            email: team.leaderId.email || '',
            institution: team.leaderId.institution || '',
            country: team.leaderId.country || ''
          } : null,
          members: (team.members || []).map((member: any) => ({
            _id: member.user?._id?.toString() || '',
            firstName: member.user?.firstName || 'Deleted User',
            lastName: member.user?.lastName || '',
            email: member.user?.email || 'deleted@example.com',
            teamRole: member.teamRole || 'member',
            institution: member.user?.institution || '',
            country: member.user?.country || '',
            joinedAt: member.joinedAt ? new Date(member.joinedAt).toISOString() : new Date().toISOString()
          })),
          createdAt: team.createdAt ? new Date(team.createdAt).toISOString() : new Date().toISOString()
        };
      } catch (error) {
        console.error(`Error transforming team ${team._id}:`, error);
        // Return a minimal valid team object to prevent the entire request from failing
        return {
          _id: team._id.toString(),
          name: team.name || 'Error Processing Team',
          category: 'Digital Platforms and Interactive Applications',
          status: 'pending',
          leaderId: '',
          leader: null,
          members: [],
          createdAt: new Date().toISOString()
        };
      }
    });
  } catch (error) {
    console.error('Error in getTeams function:', error);
    return [];
  }
}); 