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
  members: TeamMember[];
  createdAt: string;
}

export const getTeams = cache(async (): Promise<Team[]> => {
  await connectDB();
  
  const teams = await TeamModel.find({})
    .populate('members', 'firstName lastName email teamRole institution country')
    .sort({ createdAt: -1 })
    .lean();

  return teams.map((team: any) => ({
    _id: team._id.toString(),
    name: team.name || '',
    category: team.category || 'Digital Platforms and Interactive Applications',
    status: team.status || 'pending',
    members: (team.members || []).map((member: any) => ({
      _id: member._id.toString(),
      firstName: member.firstName || '',
      lastName: member.lastName || '',
      email: member.email || '',
      teamRole: member.teamRole || 'member',
      institution: member.institution,
      country: member.country
    })),
    createdAt: team.createdAt ? new Date(team.createdAt).toISOString() : new Date().toISOString()
  }));
}); 