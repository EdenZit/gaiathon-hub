import { signOut } from 'next-auth/react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

export default function AdminHeader() {
  const { data: session } = useSession();

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/admin" className="text-navy-700 text-xl font-bold">
              GAIAthon Hub Admin
            </Link>
          </div>

          {/* Right section */}
          <div className="flex items-center gap-4">
            {/* Admin name */}
            <span className="text-sm text-gray-700">
              {session?.user?.name}
            </span>

            {/* Profile dropdown */}
            <div className="relative">
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="text-sm text-gray-700 hover:text-navy-600"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
} 