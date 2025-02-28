import { Types } from 'mongoose';
import { User } from '@/lib/db/models/User';
import { IUser } from '@/types/models';

export interface TeamMemberInput {
  userId?: string;
  email?: string;
  teamRole: 'leader' | 'member';
}

export interface TeamMember {
  user: Types.ObjectId;
  teamRole: 'leader' | 'member';
  joinedAt: Date;
}

export async function createTeamMemberObject(input: TeamMemberInput): Promise<TeamMember> {
  let userId = input.userId;

  if (!userId && input.email) {
    const user = await User.findOne({ email: input.email }).lean() as IUser | null;
    if (user) {
      userId = user._id.toString();
    }
  }

  if (!userId) {
    throw new Error(`Cannot create team member: User not found for ${input.email}`);
  }

  return {
    user: new Types.ObjectId(userId),
    teamRole: input.teamRole,
    joinedAt: new Date()
  };
}

export async function createInitialTeamMembers(leaderId: string): Promise<TeamMember[]> {
  return [{
    user: new Types.ObjectId(leaderId),
    teamRole: 'leader' as const,
    joinedAt: new Date()
  }];
}

export function transformTeamMemberForResponse(member: any) {
  return {
    userId: member.user._id || member.user,
    email: member.user.email,
    firstName: member.user.firstName || '',
    lastName: member.user.lastName || '',
    teamRole: member.teamRole,
    joinedAt: member.joinedAt
  };
} 