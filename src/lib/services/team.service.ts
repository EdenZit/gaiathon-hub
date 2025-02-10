import { Types } from 'mongoose';
import { Team } from '../db/models/Team';
import { User } from '../db/models/User';
import { connectDB } from '../mongodb';
import { ITeam, ITeamMember } from '../../types/models';
import crypto from 'crypto';
import { Invitation } from '../../models/Invitation';
import { sendMail } from '../mail';

export class TeamService {
  static async createTeam(
    name: string,
    description: string,
    leaderId: string,
    memberEmails?: string[]
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

    // Update leader's teams
    await User.findByIdAndUpdate(leaderId, {
      $addToSet: { teams: team._id },
    });

    // If member emails are provided, create invitations
    if (memberEmails?.length) {
      // TODO: Implement member invitation logic
      // This would typically involve:
      // 1. Creating invitation records
      // 2. Sending invitation emails
      // 3. Setting up invitation acceptance endpoints
    }

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
    role: 'member' | 'contributor' = 'member'
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
    if (team.members.some(member => member.user.toString() === userId)) {
      throw new Error('User is already a member of this team');
    }

    // Add member with appropriate permissions
    const memberData: ITeamMember = {
      user: new Types.ObjectId(userId),
      role,
      joinedAt: new Date(),
      permissions: {
        canManageMembers: false,
        canManageDocuments: role === 'member',
        canManageProjects: role === 'member',
        canApproveProgress: false,
      },
    };

    team.members.push(memberData);
    await team.save();

    // Update user's teams
    await User.findByIdAndUpdate(userId, {
      $addToSet: { teams: team._id },
    });

    return team;
  }

  static async removeMember(teamId: string, userId: string): Promise<ITeam> {
    await connectDB();

    const team = await Team.findById(teamId);
    if (!team) {
      throw new Error('Team not found');
    }

    // Cannot remove the leader
    if (team.leader.toString() === userId) {
      throw new Error('Cannot remove team leader');
    }

    // Remove member from team
    team.members = team.members.filter(
      member => member.user.toString() !== userId
    );
    await team.save();

    // Remove team from user's teams
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

  static async resendInvitation(invitationId: string): Promise<void> {
    const invitation = await Invitation.findById(invitationId);
    if (!invitation) {
      throw new Error('Invitation not found');
    }

    // Get team details for the email
    const team = await Team.findById(invitation.teamId);
    if (!team) {
      throw new Error('Team not found');
    }

    // Get inviter details
    const inviter = await User.findById(invitation.invitedBy);
    if (!inviter) {
      throw new Error('Inviter not found');
    }

    // Generate a new token and update expiration
    invitation.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    await invitation.save();

    // Send the invitation email
    await sendMail({
      to: invitation.email,
      subject: `Reminder: Join ${team.name} on GAIAthon Hub`,
      template: 'team-invitation',
      variables: {
        teamName: team.name,
        inviterName: `${inviter.firstName} ${inviter.lastName}`,
        invitationLink: `${process.env.NEXT_PUBLIC_APP_URL}/invitations/${invitation._id}`,
        expiryDate: invitation.expiresAt.toLocaleDateString(),
      },
    });
  }

  static async processInvitation(invitationId: string, userId: string): Promise<ITeam> {
    const invitation = await Invitation.findOne({
      _id: invitationId,
      status: 'pending',
      expiresAt: { $gt: new Date() }
    });

    if (!invitation) {
      throw new Error('Invalid or expired invitation');
    }

    // Check if user is already a member
    const team = await Team.findById(invitation.teamId);
    if (!team) {
      throw new Error('Team not found');
    }

    const isMember = team.members.some(member => 
      member.user.toString() === userId
    );

    if (isMember) {
      throw new Error('You are already a member of this team');
    }

    // Add user to team
    const newMember: ITeamMember = {
      user: new Types.ObjectId(userId),
      role: invitation.role,
      joinedAt: new Date(),
      permissions: {
        canManageMembers: false,
        canManageDocuments: true,
        canManageProjects: false,
        canApproveProgress: false,
      },
    };

    team.members.push(newMember);
    await team.save();

    // Update invitation status
    invitation.status = 'accepted';
    await invitation.save();

    // Add activity
    await this.addActivity(
      team._id.toString(),
      userId,
      'member',
      'joined',
      { role: invitation.role }
    );

    return team;
  }
} 