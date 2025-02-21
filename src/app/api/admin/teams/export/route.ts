import { NextResponse, NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { connectDB } from '@/lib/mongodb';
import { Team } from '@/lib/db/models/Team';
import { adminGuard } from '@/lib/auth/adminGuard';
import { Types } from 'mongoose';

interface TeamMember {
  _id: Types.ObjectId;
  firstName: string;
  lastName: string;
  email: string;
  teamRole: 'leader' | 'member';
  institution?: string;
  country?: string;
}

interface PopulatedTeam {
  _id: Types.ObjectId;
  name: string;
  createdAt: Date;
  members: TeamMember[];
  category: string;
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
      .populate('members', 'firstName lastName email teamRole institution country')
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
      'Member Name',
      'Member Email',
      'Role',
      'Institution',
      'Country',
      'Created At'
    ].join(',');

    // Convert teams to CSV rows
    const rows = teams.flatMap(team => 
      team.members.map((member: TeamMember) => [
        team._id.toString(),
        team.name,
        team.category,
        `${member.firstName} ${member.lastName}`,
        member.email,
        member.teamRole,
        member.institution || 'Not specified',
        member.country || 'Not specified',
        new Date(team.createdAt).toISOString()
      ].map(field => `"${field}"`).join(','))
    );

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