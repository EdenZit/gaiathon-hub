import { NextResponse, NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { connectDB } from '@/lib/mongodb';
import { Team } from '@/lib/db/models/Team';
import { adminGuard } from '@/lib/auth/adminGuard';
import { Types } from 'mongoose';

interface TeamMember {
  user: {
    _id: Types.ObjectId;
    firstName: string;
    lastName: string;
    email: string;
    institution?: string;
    country?: string;
  };
  teamRole: 'leader' | 'member';
  joinedAt: Date;
}

interface PopulatedTeam {
  _id: Types.ObjectId;
  name: string;
  category: string;
  status: string;
  leaderId: {
    _id: Types.ObjectId;
    firstName: string;
    lastName: string;
    email: string;
    institution?: string;
    country?: string;
  };
  members: TeamMember[];
  createdAt: Date;
}

export async function GET(request: NextRequest) {
  try {
    // Verify admin access
    const isAdmin = await adminGuard(request, 'export_teams');
    if (!isAdmin) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    await connectDB();

    // Fetch all teams with populated member data
    const teamsData = await Team.find({})
      .populate('leaderId', 'firstName lastName email institution country')
      .populate('members.user', 'firstName lastName email institution country')
      .sort({ createdAt: -1 })
      .lean();

    // Type assertion after fetching
    const teams = teamsData as unknown as PopulatedTeam[];

    if (!teams || teams.length === 0) {
      return new NextResponse('No teams found', { status: 404 });
    }

    // Define CSV headers
    const headers = [
      'Team ID',
      'Team Name',
      'Team Category',
      'Team Status',
      'Member Name',
      'Member Email',
      'Role',
      'Institution',
      'Country',
      'Joined At',
      'Created At'
    ].join(',');

    // Convert teams to CSV rows
    const rows = teams.flatMap(team => {
      // Helper function to safely get user data
      const getUserData = (user: any) => ({
        firstName: user?.firstName || 'Unknown',
        lastName: user?.lastName || 'User',
        email: user?.email || 'No email',
        institution: user?.institution || 'Not specified',
        country: user?.country || 'Not specified'
      });

      // Get leader data safely
      const leaderData = getUserData(team.leaderId);

      // Add leader first
      const leaderRow = [
        team._id.toString(),
        team.name,
        team.category,
        team.status,
        `${leaderData.firstName} ${leaderData.lastName}`.trim(),
        leaderData.email,
        'leader',
        leaderData.institution,
        leaderData.country,
        new Date(team.createdAt).toISOString(),
        new Date(team.createdAt).toISOString()
      ].map(field => `"${field}"`).join(',');

      // Then add other members
      const memberRows = team.members
        .filter(member => member.teamRole !== 'leader')
        .map((member: TeamMember) => {
          const memberData = getUserData(member.user);
          return [
            team._id.toString(),
            team.name,
            team.category,
            team.status,
            `${memberData.firstName} ${memberData.lastName}`.trim(),
            memberData.email,
            member.teamRole,
            memberData.institution,
            memberData.country,
            new Date(member.joinedAt).toISOString(),
            new Date(team.createdAt).toISOString()
          ].map(field => `"${field}"`).join(',');
        });

      return [leaderRow, ...memberRows];
    });

    // Combine headers and rows
    const csv = [headers, ...rows].join('\n');

    // Set response headers for CSV download
    const headers_obj = new Headers();
    headers_obj.set('Content-Type', 'text/csv');
    headers_obj.set('Content-Disposition', `attachment; filename=teams_export_${new Date().toISOString().split('T')[0]}.csv`);

    return new NextResponse(csv, {
      status: 200,
      headers: headers_obj,
    });
  } catch (error) {
    console.error('Error exporting teams:', error);
    return new NextResponse('Failed to export teams', { status: 500 });
  }
}

// Apply admin middleware to all routes
export { adminMiddleware as middleware } from '@/middleware/adminMiddleware'; 