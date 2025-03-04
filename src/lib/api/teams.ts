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
  await connectDB();
  
  const teams = await TeamModel.find({})
    .populate('leaderId', 'firstName lastName email institution country')
    .populate('members.user', 'firstName lastName email institution country')
    .sort({ createdAt: -1 })
    .lean();

  return teams.map((team: any) => ({
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
  }));
}); 