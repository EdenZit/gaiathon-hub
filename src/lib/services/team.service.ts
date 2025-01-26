import { Types } from 'mongoose';
import { Team } from '../db/models/Team';
import { User } from '../db/models/User';
import { connectDB } from '../mongodb';
import { ITeam, ITeamMember } from '../../types/models';

export class TeamService {
  static async createTeam(
    name: string,
    description: string,
    leaderId: string
  ): Promise<ITeam> {
    await connectDB();

    const leader = await User.findById(leaderId);
    if (!leader) {
      throw new Error('Leader not found');
    }

    const team = new Team({
      name,
      description,
      leader: leaderId,
      members: [{
        user: leaderId,
        role: 'leader',
        joinedAt: new Date(),
        permissions: {
          canManageMembers: true,
          canManageDocuments: true,
          canManageProjects: true,
          canApproveProgress: true,
        },
      }],
    });

    await team.save();

    // Update user's teams
    await User.findByIdAndUpdate(leaderId, {
      $push: { teams: team._id },
    });

    return team;
  }

  static async getTeamById(teamId: string): Promise<ITeam | null> {
    await connectDB();
    return Team.findById(teamId)
      .populate('leader', 'name email')
      .populate('members.user', 'name email');
  }

  static async addMember(
    teamId: string,
    userId: string,
    role: ITeamMember['role'] = 'member'
  ): Promise<ITeam> {
    await connectDB();

    const team = await Team.findById(teamId);
    if (!team) {
      throw new Error('Team not found');
    }

    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Check if user is already a member
    if (team.members.some((member: ITeamMember) => member.user.toString() === userId)) {
      throw new Error('User is already a member of this team');
    }

    // Add member to team
    team.members.push({
      user: new Types.ObjectId(userId),
      role,
      joinedAt: new Date(),
      permissions: {
        canManageMembers: role === 'leader',
        canManageDocuments: role === 'leader',
        canManageProjects: role === 'leader',
        canApproveProgress: role === 'leader',
      },
    });

    // Add activity
    team.activity.push({
      type: 'member',
      action: 'Member joined',
      user: new Types.ObjectId(userId),
      timestamp: new Date(),
      details: {
        role,
      },
    });

    await team.save();

    // Update user's teams
    await User.findByIdAndUpdate(userId, {
      $push: { teams: team._id },
    });

    return team;
  }

  static async removeMember(teamId: string, userId: string): Promise<ITeam> {
    await connectDB();

    const team = await Team.findById(teamId);
    if (!team) {
      throw new Error('Team not found');
    }

    // Check if user is the leader
    if (team.leader.toString() === userId) {
      throw new Error('Team leader cannot be removed');
    }

    // Remove member from team
    team.members = team.members.filter(
      (member: ITeamMember) => member.user.toString() !== userId
    );

    // Add activity
    team.activity.push({
      type: 'member',
      action: 'Member removed',
      user: new Types.ObjectId(userId),
      timestamp: new Date(),
      details: {},
    });

    await team.save();

    // Update user's teams
    await User.findByIdAndUpdate(userId, {
      $pull: { teams: team._id },
    });

    return team;
  }

  static async updateMemberRole(
    teamId: string,
    userId: string,
    newRole: ITeamMember['role']
  ): Promise<ITeam> {
    await connectDB();

    const team = await Team.findById(teamId);
    if (!team) {
      throw new Error('Team not found');
    }

    const memberIndex = team.members.findIndex(
      (member: ITeamMember) => member.user.toString() === userId
    );

    if (memberIndex === -1) {
      throw new Error('Member not found');
    }

    // Update role and permissions
    team.members[memberIndex].role = newRole;
    team.members[memberIndex].permissions = {
      canManageMembers: newRole === 'leader',
      canManageDocuments: newRole === 'leader',
      canManageProjects: newRole === 'leader',
      canApproveProgress: newRole === 'leader',
    };

    // Add activity
    team.activity.push({
      type: 'member',
      action: 'Role updated',
      user: new Types.ObjectId(userId),
      timestamp: new Date(),
      details: {
        newRole,
      },
    });

    await team.save();
    return team;
  }

  static async getTeamsByMember(userId: string): Promise<ITeam[]> {
    await connectDB();
    return Team.find({ 'members.user': userId })
      .populate('leader', 'name email')
      .populate('members.user', 'name email');
  }

  static async addActivity(
    teamId: string,
    userId: string,
    type: 'member' | 'project' | 'document' | 'progress',
    action: string,
    details: Record<string, any> = {}
  ): Promise<ITeam> {
    await connectDB();

    const team = await Team.findById(teamId);
    if (!team) {
      throw new Error('Team not found');
    }

    team.activity.push({
      type,
      action,
      user: new Types.ObjectId(userId),
      timestamp: new Date(),
      details,
    });

    await team.save();
    return team;
  }
} 