import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Project } from '@/models/Project';
import { Document } from '@/models/Document';
import { Team } from '@/models/Team';
import { connectToDatabase } from '@/lib/mongodb';
import { teamMethods } from '@/lib/services/redis';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    await connectToDatabase();

    // Get user's team
    const team = await Team.findOne({
      $or: [
        { owner: session.user.id },
        { members: session.user.id }
      ]
    });

    if (!team) {
      return new NextResponse('Team not found', { status: 404 });
    }

    // Try to get cached stats first
    const cachedStats = await teamMethods.getCachedTeamMembers(team._id.toString());
    if (cachedStats) {
      return NextResponse.json(JSON.parse(cachedStats));
    }

    // Get projects stats
    const projects = await Project.find({ team: team._id });
    const totalProjects = projects.length;
    const completedProjects = projects.filter(p => p.status === 'completed').length;
    const inProgressProjects = projects.filter(p => p.status === 'in-progress').length;

    // Get upcoming milestones
    const upcomingMilestones = projects.reduce((acc: any[], project) => {
      const projectMilestones = project.milestones
        .filter(m => m.status !== 'completed' && new Date(m.dueDate) > new Date())
        .map(m => ({
          title: m.title,
          dueDate: m.dueDate,
          project: project.name
        }));
      return [...acc, ...projectMilestones];
    }, [])
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 5);

    // Get recent activity from Redis
    const recentActivity = await teamMethods.getTeamActivity(team._id.toString());

    // Get member contributions
    const memberContributions = await Promise.all(
      team.members.map(async (memberId: string) => {
        const completedTasks = projects.reduce((total, project) => {
          return total + project.milestones.filter(m => 
            m.status === 'completed' && 
            m.assignedTo.includes(memberId)
          ).length;
        }, 0);

        const documentsEdited = await Document.countDocuments({
          lastEditedBy: memberId,
          team: team._id
        });

        const lastActive = await Document.findOne({
          lastEditedBy: memberId,
          team: team._id
        })
        .sort({ updatedAt: -1 })
        .select('updatedAt');

        return {
          userId: memberId,
          completedTasks,
          documentsEdited,
          lastActive: lastActive?.updatedAt || new Date()
        };
      })
    );

    const stats = {
      totalProjects,
      completedProjects,
      inProgressProjects,
      upcomingMilestones,
      recentActivity,
      memberContributions
    };

    // Cache the stats
    await teamMethods.cacheTeamMembers(team._id.toString(), JSON.stringify(stats));

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching team stats:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 