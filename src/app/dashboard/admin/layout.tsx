import { AdminGuard } from "@/components/auth/AdminGuard";
import { 
  UsersIcon, 
  Cog6ToothIcon, 
  ChartBarIcon,
  DocumentChartBarIcon,
  ShieldCheckIcon
} from "@heroicons/react/24/outline";

const adminNavItems = [
  {
    name: "User Management",
    href: "/dashboard/admin/users",
    icon: UsersIcon,
    description: "Manage users and permissions"
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
    name: "Reports",
    href: "/dashboard/admin/reports",
    icon: DocumentChartBarIcon,
    description: "Generate and view reports"
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
  return (
    <AdminGuard>
      <div className="flex min-h-screen">
        {/* Admin Sidebar */}
        <aside className="w-64 bg-gray-900 text-white">
          <div className="p-4">
            <h2 className="text-xl font-semibold">Admin Dashboard</h2>
          </div>
          <nav className="mt-4">
            {adminNavItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="flex items-center px-4 py-3 text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
              >
                <item.icon className="h-5 w-5 mr-3" />
                <span>{item.name}</span>
              </a>
            ))}
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