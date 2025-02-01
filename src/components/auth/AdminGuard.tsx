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

  // Redirect non-admin users
  if (status === "authenticated" && session?.user?.role !== "admin") {
    redirect("/dashboard");
  }

  // Show fallback for unauthenticated users
  if (status === "unauthenticated") {
    if (fallback) {
      return <>{fallback}</>;
    }
    redirect("/login");
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