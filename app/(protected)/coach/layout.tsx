'use client';

import type { Metadata } from "next";
import { useState } from "react";
import { useSession } from "next-auth/react";
// import "../globals.css";
import { CoachNavbar } from "@/app/ui/dashboard/coach-navbar";
import { CoachSidebar } from "@/app/ui/dashboard/coach-sidebar";

// Note: You'll need to move metadata to a separate metadata.ts file or handle it differently
// since this is now a client component
// export const metadata: Metadata = {
//   title: "Coaching Portal | Cade Collenback Strength",
//   description: "Manage clients, programs, and coaching sessions.",
// };

export default function CoachingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { data: session } = useSession();
  
  // Extract user name from session
  const userName = session?.user?.firstName && session?.user?.lastName 
    ? `${session.user.firstName} ${session.user.lastName}`
    : session?.user?.firstName 
    ? session.user.firstName
    : 'Coach';

  return (
    <div className="min-h-screen bg-grey-100">
      {/* Mobile sidebar */}
      <div className="lg:hidden">
        <CoachSidebar 
          mobile 
          sidebarOpen={sidebarOpen} 
          setSidebarOpen={setSidebarOpen} 
        />
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
        <CoachSidebar />
      </div>

      <div className="lg:pl-72">
        {/* Top navbar */}
        <CoachNavbar 
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