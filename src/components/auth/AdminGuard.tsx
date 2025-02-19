'use client';

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { ReactNode } from "react";
import { Spinner } from "@/components/ui/Spinner";

interface AdminGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export function AdminGuard({ children, fallback }: AdminGuardProps) {
  const { data: session, status } = useSession();

  // Show loading state while session is being fetched
  if (status === "loading") {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <Spinner />
      </div>
    );
  }

  // Redirect non-admin users to dashboard
  if (status === "authenticated" && session?.user?.role !== "admin") {
    console.log('User is not admin, redirecting to dashboard');
    redirect("/dashboard");
  }

  // Show fallback or redirect unauthenticated users to admin login
  if (status === "unauthenticated") {
    console.log('User is not authenticated, redirecting to admin login');
    if (fallback) {
      return <>{fallback}</>;
    }
    redirect("/admin-login");
  }

  // Render children for admin users
  return <>{children}</>;
}

// HOC for wrapping components with admin guard
export function withAdminGuard<P extends object>(
  Component: React.ComponentType<P>
) {
  return function AdminGuardedComponent(props: P) {
    return (
      <AdminGuard>
        <Component {...props} />
      </AdminGuard>
    );
  };
} 