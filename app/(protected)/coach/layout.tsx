import type { Metadata } from "next";
import "../globals.css";
import { CoachNavbar } from "@/app/ui/coaching/coach-navbar";
import { CoachSidebar } from "@/app/ui/coaching/coach-sidebar";

export const metadata: Metadata = {
  title: "Coaching Portal | Cade Collenback Strength",
  description: "Manage clients, programs, and coaching sessions.",
};

export default function CoachingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-grey-100">
      {/* Mobile sidebar */}
      <div className="lg:hidden">
        <CoachSidebar mobile />
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
        <CoachSidebar />
      </div>

      <div className="lg:pl-72">
        {/* Top navbar */}
        <CoachNavbar />

        {/* Main content */}
        <main className="py-6">
          <div className="px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}