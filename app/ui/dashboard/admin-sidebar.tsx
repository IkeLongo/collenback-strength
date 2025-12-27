"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { cn } from "@/app/lib/utils";

interface AdminSidebarProps {
  mobile?: boolean;
  sidebarOpen?: boolean;
  setSidebarOpen?: (open: boolean) => void;
}

const navigation = [
  { name: "Dashboard", href: "/admin/dashboard", icon: HomeIcon },
  { name: "Availability", href: "/admin/my-schedule", icon: MyScheduleIcon },
  { name: "Schedule", href: "/admin/sessions", icon: SessionsIcon },
  { name: "Clients", href: "/admin/users", icon: UsersIcon },
  { name: "Programs", href: "/admin/programs", icon: ClipboardIcon },
  { name: "Purchases", href: "/admin/purchases", icon: ChartBarIcon },
  // { name: "Credit Ledger", href: "/admin/credit-ledger", icon: CogIcon },
];

function MyScheduleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" {...props}>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 3v4M8 3v4" />
      <circle cx="16.5" cy="16.5" r="4" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 14.5v2l1.5 1.5" />
    </svg>
  );
}

function SessionsIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" {...props}>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 3v4M8 3v4" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.5 14.5l2 2l3-3" />
    </svg>
  );
}

function HomeIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
    </svg>
  );
}

function UsersIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
    </svg>
  );
}

function ClipboardIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.150 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
    </svg>
  );
}

function ChartBarIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" {...props}>
      <circle cx="8.5" cy="20" r="1.5" />
      <circle cx="17.5" cy="20" r="1.5" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 4h2l2.68 11.39A2 2 0 009.61 17h6.78a2 2 0 001.93-1.53L21 7H6" />
    </svg>
  );
}

// function CogIcon(props: React.SVGProps<SVGSVGElement>) {
//   return (
//     <svg fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" {...props}>
//       <rect x="3" y="6" width="18" height="12" rx="2" />
//       <rect x="6" y="14" width="4" height="2" rx="0.5" />
//       <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18" />
//     </svg>
//   );
// }

export function AdminSidebar({ mobile = false, sidebarOpen = false, setSidebarOpen }: AdminSidebarProps) {
  const pathname = usePathname();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await signOut({ callbackUrl: "/auth", redirect: true });
    } catch (error) {
      // console.error("Logout error:", error);
      setIsLoggingOut(false);
    }
  };

  useEffect(() => {
    if (sidebarOpen) {
      setMounted(true);
      // next paint so transitions apply
      requestAnimationFrame(() => setIsVisible(true));
    } else {
      // start exit animation
      setIsVisible(false);

      // unmount after transition duration (match duration-200 below)
      const t = window.setTimeout(() => setMounted(false), 220);
      return () => window.clearTimeout(t);
    }
  }, [sidebarOpen]);

  const sidebarContent = (
    <div className="flex h-full grow flex-col gap-y-5 overflow-y-auto bg-grey-900 px-6 pb-4">
      <div className="flex h-16 shrink-0 items-center pt-4">
        <img className="h-12 w-auto" src="/logo-horizontal.png" alt="Cade Collenback Strength" />
      </div>

      <nav className="flex flex-1 flex-col">
        <ul role="list" className="flex flex-1 flex-col gap-y-7">
          <li>
            <ul role="list" className="-mx-2 space-y-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      onClick={() => {
                        // close drawer on mobile after navigation
                        if (mobile) setSidebarOpen?.(false);
                      }}
                      className={cn(
                        isActive ? "bg-grey-800 text-white" : "text-grey-400 hover:text-white hover:bg-grey-800",
                        "group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold"
                      )}
                    >
                      <item.icon
                        className={cn(
                          isActive ? "text-white" : "text-grey-400 group-hover:text-white",
                          "h-6 w-6 shrink-0"
                        )}
                        aria-hidden="true"
                      />
                      {item.name}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </li>

          <li className="mt-auto">
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className={cn(
                "group -mx-2 flex w-full gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 hover:cursor-pointer",
                isLoggingOut ? "bg-grey-800 text-grey-300 cursor-not-allowed" : "text-grey-400 hover:bg-grey-800 hover:text-white"
              )}
            >
              {isLoggingOut ? "Signing out…" : "Sign out"}
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );

  // MOBILE DRAWER
  if (mobile) {
    if (!mounted) return null;

    return (
      <div
        className="fixed inset-0 z-50 lg:hidden"
        aria-hidden={!sidebarOpen}
      >
        {/* Backdrop */}
        <div
          className={[
            "absolute inset-0 bg-grey-900/80 transition-opacity duration-200 ease-out",
            isVisible ? "opacity-100" : "opacity-0",
          ].join(" ")}
          onClick={() => setSidebarOpen?.(false)}
        />

        {/* Drawer */}
        <div
          className={[
            "absolute inset-y-0 left-0 w-72 max-w-[85vw] shadow-xl",
            "transform transition-transform duration-200 ease-out will-change-transform",
            isVisible ? "translate-x-0" : "-translate-x-full",
          ].join(" ")}
          // prevent backdrop click when interacting with drawer
          onClick={(e) => e.stopPropagation()}
        >
          <div className="relative h-full">
            {/* Close button */}
            <button
              type="button"
              className="absolute right-3 top-3 rounded-md p-2 text-white/90 hover:text-white"
              onClick={() => setSidebarOpen?.(false)}
            >
              <span className="sr-only">Close sidebar</span>
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {sidebarContent}
          </div>
        </div>
      </div>
    );
  }

  // DESKTOP SIDEBAR CONTENT
  return sidebarContent;
}
