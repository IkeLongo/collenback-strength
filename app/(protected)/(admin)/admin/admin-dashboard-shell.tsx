"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { AdminNavbar } from "@/app/ui/dashboard/admin-navbar";
import { AdminSidebar } from "@/app/ui/dashboard/admin-sidebar";

export default function AdminShell({
  children,
}: {
  children: React.ReactNode;
}) {
  // mobile overlay open/close
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // desktop (lg+) open/close
  const [desktopSidebarOpen, setDesktopSidebarOpen] = useState(true);

  const { data: session } = useSession();

  const userName =
    session?.user?.firstName && session?.user?.lastName
      ? `${session.user.firstName} ${session.user.lastName}`
      : session?.user?.firstName || "Admin";

  // optional: remember desktop preference
  useEffect(() => {
    const saved = localStorage.getItem("adminSidebarOpen");
    if (saved === "0") setDesktopSidebarOpen(false);
    if (saved === "1") setDesktopSidebarOpen(true);
  }, []);

  useEffect(() => {
    localStorage.setItem("adminSidebarOpen", desktopSidebarOpen ? "1" : "0");
  }, [desktopSidebarOpen]);

  return (
    <div className="min-h-screen bg-grey-100">
      {/* Mobile sidebar overlay (unchanged behavior) */}
      <div className="lg:hidden">
        <AdminSidebar
          mobile
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />
      </div>

      {/* Desktop sidebar (collapsible) */}
      <div
        className={[
          "hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:flex-col lg:h-screen lg:overflow-y-auto",
          "transition-all duration-200 ease-in-out",
          desktopSidebarOpen ? "lg:w-72" : "lg:w-0",
        ].join(" ")}
      >
        {/* When collapsed, hide content and prevent it from intercepting clicks */}
        <div className={desktopSidebarOpen ? "w-72 h-full flex flex-col" : "w-0 h-full overflow-hidden pointer-events-none flex flex-col"}>
          <AdminSidebar />
        </div>
      </div>

      {/* Main content shifts based on desktop sidebar state */}
      <div
        className={[
          "transition-all duration-200 ease-in-out",
          desktopSidebarOpen ? "lg:pl-72" : "lg:pl-0",
        ].join(" ")}
      >
        <AdminNavbar
          setSidebarOpen={setSidebarOpen} // mobile hamburger
          userName={userName}
          desktopSidebarOpen={desktopSidebarOpen}
          setDesktopSidebarOpen={setDesktopSidebarOpen}
        />

        <main className="py-4 sm:py-6 overflow-x-hidden">
          <div className="px-3 sm:px-4 md:px-6 lg:px-8 overflow-x-hidden">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
