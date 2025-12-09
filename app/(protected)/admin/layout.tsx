'use client';

import type { Metadata } from "next";
import { useState } from "react";
import { useSession } from "next-auth/react";
// import "../globals.css";
import { AdminNavbar } from "@/app/ui/dashboard/admin-navbar";
import { AdminSidebar } from "@/app/ui/dashboard/admin-sidebar";

// Note: You'll need to move metadata to a separate metadata.ts file or handle it differently
// since this is now a client component
// export const metadata: Metadata = {
//   title: "Client Dashboard | Cade Collenback Strength",
//   description: "Access your personalized fitness programs and track your progress.",
// };

export default function ClientDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { data: session } = useSession();
  
  const userName = session?.user?.firstName && session?.user?.lastName 
    ? `${session.user.firstName} ${session.user.lastName}` 
    : session?.user?.firstName || 'Admin';

  return (
    <div className="min-h-screen bg-grey-100">
      {/* Mobile sidebar */}
      <div className="lg:hidden">
        <AdminSidebar 
          mobile 
          sidebarOpen={sidebarOpen} 
          setSidebarOpen={setSidebarOpen} 
        />
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
        <AdminSidebar />
      </div>

      <div className="lg:pl-72">
        {/* Top navbar */}
        <AdminNavbar 
          setSidebarOpen={setSidebarOpen}
          userName={userName}
        />

        {/* Main content */}
        <main className="py-4 sm:py-6">
          <div className="px-3 sm:px-4 md:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}