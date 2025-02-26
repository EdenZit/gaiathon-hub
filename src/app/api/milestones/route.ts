import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Project } from '@/models/Project';
import { connectDB } from '@/lib/mongodb';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const db = await connectDB();
    const projects = await Project.find({}, 'milestones')
      .populate('milestones.assignedTo', 'name email');

    const milestones = projects.reduce((acc: any[], project) => {
      return acc.concat(project.milestones.map(milestone => ({
        ...milestone.toObject(),
        projectId: project._id
      })));
    }, []);

    // Sort by due date
    milestones.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

    return NextResponse.json(milestones);
  } catch (error) {
    console.error('Error fetching milestones:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await request.json();
    const { projectId, title, description, dueDate, assignedTo } = body;

    const db = await connectDB();
    const project = await Project.findById(projectId);
    
    if (!project) {
      return new NextResponse('Project not found', { status: 404 });
    }

    project.milestones.push({
      title,
      description,
      dueDate,
      assignedTo,
      status: 'pending'
    });

    await project.save();

    return NextResponse.json(project.milestones[project.milestones.length - 1]);
  } catch (error) {
    console.error('Error creating milestone:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await request.json();
    const { projectId, milestoneId, status } = body;

    const db = await connectDB();
    const project = await Project.findById(projectId);
    
    if (!project) {
      return new NextResponse('Project not found', { status: 404 });
    }

    const milestone = project.milestones.id(milestoneId);
    if (!milestone) {
      return new NextResponse('Milestone not found', { status: 404 });
    }

    milestone.status = status;
    await project.save();

    // Update project progress
    const completedMilestones = project.milestones.filter(m => m.status === 'completed').length;
    project.progress = Math.round((completedMilestones / project.milestones.length) * 100);
    await project.save();

    return NextResponse.json(milestone);
  } catch (error) {
    console.error('Error updating milestone:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 