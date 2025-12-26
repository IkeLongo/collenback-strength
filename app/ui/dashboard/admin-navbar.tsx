"use client";

import React, { useState } from "react";
import { signOut } from "next-auth/react";
import { cn } from "@/app/lib/utils";
import { usePathname } from "next/navigation";
import { UserAvatar } from "@/app/ui/components/user/user-avatar";
import { useSession } from "next-auth/react";

type AdminNavbarProps = {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;

  userName: string;

  desktopSidebarOpen?: boolean;
  setDesktopSidebarOpen?: (open: boolean) => void;
};

export function AdminNavbar({
  sidebarOpen,
  setSidebarOpen,
  userName = "Admin",
  desktopSidebarOpen,
  setDesktopSidebarOpen,
}: AdminNavbarProps) {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const { data: session } = useSession();
  const avatarKey = (session?.user as any)?.avatarKey as string | null;

  const avatarUrl = avatarKey
    ? `${process.env.NEXT_PUBLIC_R2_PUBLIC_BASE_URL!.replace(/\/$/, "")}/${avatarKey}`
    : null;

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await signOut({
        callbackUrl: "/auth",
        redirect: true,
      });
    } catch (error) {
      console.error("Logout error:", error);
      setIsLoggingOut(false);
    }
  };

  const canToggleDesktop =
    typeof desktopSidebarOpen === "boolean" && typeof setDesktopSidebarOpen === "function";

  const pathname = usePathname();

  const NAV_TITLES: Array<{ href: string; title: string }> = [
    { href: "/admin/dashboard", title: "Dashboard" },
    { href: "/admin/my-schedule", title: "Availability" },
    { href: "/admin/sessions", title: "Client Schedule" },
    { href: "/admin/users", title: "Clients" },
    { href: "/admin/programs", title: "Programs" },
    { href: "/admin/purchases", title: "Purchases" },
    { href: "/admin/credit-ledger", title: "Credit Ledger" },
  ];

  const currentTitle =
    NAV_TITLES.sort((a, b) => b.href.length - a.href.length).find(
      (x) => pathname === x.href || pathname.startsWith(x.href + "/")
    )?.title ?? "Dashboard";

  return (
    <div className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-x-3 border-b border-grey-200 bg-white px-3 shadow-sm sm:px-4 md:px-6 lg:px-8">
      {/* Mobile hamburger (<lg) */}
      <button
        type="button"
        className="lg:hidden -m-2.5 p-2.5 text-grey-700 hover:text-grey-900"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        aria-label="Open sidebar"
        title="Open sidebar"
      >
        <span className="sr-only">Open sidebar</span>
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
        </svg>
      </button>

      {/* Desktop sidebar toggle (lg+) */}
      {canToggleDesktop && (
        <button
          type="button"
          className="hidden lg:inline-flex -m-2.5 p-2.5 text-grey-700 hover:text-grey-900"
          onClick={() => setDesktopSidebarOpen(!desktopSidebarOpen)}
          aria-label={desktopSidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
          title={desktopSidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
        >
          {desktopSidebarOpen ? (
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 18l-6-6 6-6" />
            </svg>
          ) : (
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 18l6-6-6-6" />
            </svg>
          )}
        </button>
      )}

      <div className="h-6 w-px bg-grey-200" aria-hidden="true" />

      <div className="flex flex-1 items-center min-w-0 gap-x-3">
        <h1 className="text-2xl! md:text-3xl! font-semibold! text-grey-900! truncate min-w-0">
          {currentTitle}
        </h1>

        <div className="ml-auto flex items-center gap-x-3 sm:gap-x-4">
          <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-grey-200" aria-hidden="true" />

          <div className="relative">
            <button
              type="button"
              className="-m-1.5 flex items-center p-1.5"
              onClick={() => setUserMenuOpen(!userMenuOpen)}
            >
              <span className="sr-only">Open user menu</span>
              <UserAvatar name={userName} avatarUrl={avatarUrl} size={32} />

              <span className="flex items-center">
                <span className="ml-3 text-xs sm:text-sm font-semibold leading-6 text-grey-900 hidden sm:inline" aria-hidden="true">
                  {userName}
                </span>
                <svg
                  className={cn(
                    "ml-2 h-5 w-5 text-grey-400 transform transition-transform duration-200",
                    userMenuOpen ? "rotate-180" : "rotate-0"
                  )}
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                    clipRule="evenodd"
                  />
                </svg>
              </span>
            </button>

            {userMenuOpen && (
              <div className="absolute right-0 z-40 mt-2.5 w-40 origin-top-right rounded-md bg-white py-2 px-2 shadow-lg ring-1 ring-grey-900/5 focus:outline-none">
                <a
                  href="/admin/profile"
                  className="block px-3 py-2 text-sm! font-medium! leading-6! text-grey-900! hover:bg-grey-100! rounded-md! mb-1"
                >
                  Your profile
                </a>

                <button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className={cn(
                    "block w-full text-left px-3 py-2 text-sm! font-[outfit]! font-medium! leading-6! rounded-md transition-colors duration-200",
                    isLoggingOut
                      ? "text-grey-500 bg-grey-50 cursor-not-allowed"
                      : "text-grey-900 hover:bg-grey-100 hover:cursor-pointer"
                  )}
                >
                  {isLoggingOut ? "Signing out…" : "Sign out"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
