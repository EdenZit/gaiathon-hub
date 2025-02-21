'use client';

import { AdminGuard } from "@/components/auth/AdminGuard";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import { 
  UsersIcon, 
  UserGroupIcon,
  Cog6ToothIcon, 
  ChartBarIcon,
  DocumentChartBarIcon,
  ShieldCheckIcon,
  HomeIcon,
  DocumentTextIcon
} from "@heroicons/react/24/outline";

const adminNavItems = [
  {
    name: "Dashboard",
    href: "/dashboard/admin",
    icon: HomeIcon,
    description: "Admin dashboard overview"
  },
  {
    name: "User Management",
    href: "/dashboard/admin/users",
    icon: UsersIcon,
    description: "Manage users and permissions"
  },
  {
    name: "Teams",
    href: "/dashboard/admin/teams",
    icon: UserGroupIcon,
    description: "Manage teams and registrations"
  },
  {
    name: "System Settings",
    href: "/dashboard/admin/settings",
    icon: Cog6ToothIcon,
    description: "Configure system settings"
  },
  {
    name: "Analytics",
    href: "/dashboard/admin/analytics",
    icon: ChartBarIcon,
    description: "View system analytics"
  },
  {
    name: "Security",
    href: "/dashboard/admin/security",
    icon: ShieldCheckIcon,
    description: "Security settings and logs"
  }
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <AdminGuard>
      <div className="flex min-h-screen">
        {/* Admin Sidebar */}
        <aside className="w-64 bg-gray-900 text-white">
          <div className="p-4">
            <h2 className="text-xl font-semibold">Admin Dashboard</h2>
          </div>
          <nav className="mt-4">
            {adminNavItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={clsx(
                    "flex items-center px-4 py-3 transition-colors",
                    isActive
                      ? "bg-gray-800 text-white"
                      : "text-gray-300 hover:bg-gray-800 hover:text-white"
                  )}
                >
                  <item.icon className={clsx(
                    "h-5 w-5 mr-3",
                    isActive ? "text-white" : "text-gray-400"
                  )} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 bg-gray-100">
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </AdminGuard>
  );
} 