import type { Metadata } from "next";
// import "../globals.css";
import { ClientNavbar } from "@/app/ui/dashboard/client-navbar";
import { ClientSidebar } from "@/app/ui/dashboard/client-sidebar";

export const metadata: Metadata = {
  title: "Client Dashboard | Cade Collenback Strength",
  description: "Access your personalized fitness programs and track your progress.",
};

export default function ClientDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-grey-100">
      {/* Mobile sidebar */}
      <div className="lg:hidden">
        <ClientSidebar mobile />
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
        <ClientSidebar />
      </div>

      <div className="lg:pl-72">
        {/* Top navbar */}
        <ClientNavbar />

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