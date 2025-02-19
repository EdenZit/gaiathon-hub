'use client';

import { useSession } from 'next-auth/react';

interface TeamMember {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  teamRole: 'leader' | 'member';
}

interface TeamMembersProps {
  members: TeamMember[];
}

export default function TeamMembers({ members }: TeamMembersProps) {
  const { data: session } = useSession();

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Team Members</h2>
      <div className="grid gap-4">
        {members.map((member) => (
          <div 
            key={member._id}
            className="flex items-center justify-between p-4 bg-white rounded-lg shadow"
          >
            <div>
              <h3 className="font-medium">
                {member.firstName} {member.lastName}
                {member.teamRole === 'leader' && (
                  <span className="ml-2 text-sm text-blue-600">(Team Leader)</span>
                )}
              </h3>
              <p className="text-sm text-gray-600">{member.email}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 