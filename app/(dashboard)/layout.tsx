"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/app/components/Sidebar";
import { useAuth } from "@/app/contexts/AuthContext";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { session, loading, signOut } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !session) {
      router.replace("/login");
    }
  }, [session, loading, router]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-pulse text-gray-500 dark:text-gray-400">Loading...</div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-white dark:bg-gray-900">
      <Sidebar
        onLogout={async () => {
          await signOut();
          router.push("/login");
        }}
      />
      <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900">
        {children}
      </main>
    </div>
  );
}
