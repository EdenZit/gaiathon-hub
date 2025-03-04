import type { DefaultSession } from 'next-auth';
import type { JWT as DefaultJWT } from 'next-auth/jwt';

type UserRole = 'user' | 'admin' | 'team_leader';
type UserStatus = 'active' | 'inactive';
type TeamRole = 'leader' | 'member';

interface ExtendedUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  name: string;
  role: UserRole;
  status: UserStatus;
  teamRole: TeamRole;
}

declare module 'next-auth' {
  interface User extends ExtendedUser {}

  interface Session {
    user: ExtendedUser;
    expires: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT extends DefaultJWT, ExtendedUser {}
} 