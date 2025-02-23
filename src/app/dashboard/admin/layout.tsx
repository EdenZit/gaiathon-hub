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
  DocumentTextIcon,
  ExclamationTriangleIcon,
  PhotoIcon,
  CalendarIcon,
  NewspaperIcon,
  CircleStackIcon
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
    name: "Gallery",
    href: "/dashboard/admin/gallery",
    icon: PhotoIcon,
    description: "Manage gallery images and content"
  },
  {
    name: "Events",
    href: "/dashboard/admin/events",
    icon: CalendarIcon,
    description: "Manage announcements and important dates"
  },
  {
    name: "Blog",
    href: "/dashboard/admin/blog",
    icon: NewspaperIcon,
    description: "Manage blog posts and content"
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
    description: "Security settings and logs",
    children: [
      {
        name: "Error Monitoring",
        href: "/dashboard/admin/security/errors",
        icon: ExclamationTriangleIcon,
        description: "Monitor and manage system errors"
      }
    ]
  },
  {
    name: "Database",
    href: "/dashboard/admin/db/cleanup",
    icon: CircleStackIcon,
    description: "Database maintenance and cleanup"
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
              const isActive = pathname === item.href || 
                (item.children?.some(child => pathname === child.href));
              return (
                <div key={item.name}>
                  <Link
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
                  {item.children && (
                    <div className="ml-8 mt-1">
                      {item.children.map((child) => {
                        const isChildActive = pathname === child.href;
                        return (
                          <Link
                            key={child.name}
                            href={child.href}
                            className={clsx(
                              "flex items-center px-4 py-2 text-sm transition-colors",
                              isChildActive
                                ? "bg-gray-800 text-white"
                                : "text-gray-300 hover:bg-gray-800 hover:text-white"
                            )}
                          >
                            <child.icon className={clsx(
                              "h-4 w-4 mr-3",
                              isChildActive ? "text-white" : "text-gray-400"
                            )} />
                            <span>{child.name}</span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
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