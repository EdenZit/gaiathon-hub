import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Authentication - GAIAthon Hub",
  description: "Login or register for GAIAthon Hub",
};

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession();

  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
        {children}
      </div>
    </div>
  );
} 