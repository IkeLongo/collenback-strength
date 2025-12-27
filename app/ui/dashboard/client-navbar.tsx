'use client';

import React, { useState } from 'react';
import { signOut } from 'next-auth/react';
import { cn } from '@/app/lib/utils';
import { useCartDrawer } from "@/app/ui/components/cart/cart-drawer-context";
import { useShoppingCart } from "use-shopping-cart";
import { UserAvatar } from "@/app/ui/components/user/user-avatar";
import { useSession } from 'next-auth/react';
import { usePathname } from "next/navigation";

interface ClientNavbarProps {
  setSidebarOpen?: (open: boolean) => void;
  userName?: string;
}

export function ClientNavbar({ setSidebarOpen, userName = 'User' }: ClientNavbarProps) {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { setOpen: setCartOpen } = useCartDrawer();
  const { cartCount } = useShoppingCart();
  const count = cartCount ?? 0;
  
  const { data: session } = useSession();
  const avatarKey = (session?.user as any)?.avatarKey as string | null;

  const avatarUrl = avatarKey
    ? `${process.env.NEXT_PUBLIC_R2_PUBLIC_BASE_URL!.replace(/\/$/, "")}/${avatarKey}`
    : null;

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await signOut({ 
        callbackUrl: '/auth',
        redirect: true 
      });
    } catch (error) {
      // console.error('Logout error:', error);
      setIsLoggingOut(false);
    }
  };

  const pathname = usePathname();

  const NAV_TITLES: Array<{ href: string; title: string }> = [
    { href: "/client/dashboard", title: "Dashboard" },
    { href: "/client/schedule", title: "Schedule" },
    { href: "/client/programs", title: "Programs" },
    { href: "/client/profile", title: "Profile" },
  ];

  // Pick the best match (supports subroutes like /client/programs/123)
  const currentTitle =
    NAV_TITLES
      .sort((a, b) => b.href.length - a.href.length)
      .find((x) => pathname === x.href || pathname.startsWith(x.href + "/"))
      ?.title ?? "Dashboard";

  return (
    <div className="sticky top-0 z-40 flex w-full h-16 shrink-0 items-center gap-x-4 border-b border-grey-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
      {/* Mobile menu button */}
      <button
        type="button"
        className="-m-2.5 p-2.5 text-grey-700 lg:hidden"
        onClick={() => setSidebarOpen?.(true)}
      >
        <span className="sr-only">Open sidebar</span>
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
        </svg>
      </button>

      {/* Separator */}
      <div className="h-6 w-px bg-grey-200 lg:hidden" aria-hidden="true" />

      <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
        <div className="flex flex-1 items-center">
          <h1 className="text-xl font-semibold text-grey-900!">
            {currentTitle}
          </h1>
        </div>
        
        {/* User menu */}
        <div className="flex items-center gap-x-4 lg:gap-x-6">

          {/* Notifications */}
          <button type="button" className="-m-2.5 p-2.5 text-grey-400 hover:text-grey-500!">
            <span className="sr-only">View notifications</span>
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
            </svg>
          </button>

          {/* Cart */}
          <button
            type="button"
            className="relative -m-2.5 p-2.5 text-grey-400 hover:text-grey-500!"
            onClick={() => setCartOpen(true)} // keep your drawer open handler
          >
            <span className="sr-only">View cart</span>

            {/* Badge */}
            {count > 0 && (
              <span
                className="
                  absolute
                  top-0
                  right-0
                  h-5!
                  min-w-[1.25rem]!
                  px-1!
                  rounded-full!
                  bg-red-600
                  text-white!
                  font-sans
                  text-xs!
                  font-extrabold!
                  leading-5!
                  text-center!
                  shadow-md!
                  border
                  border-white
                "
              >
                {count > 99 ? "99+" : count}
              </span>
            )}

            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6.75 21a.75.75 0 100-1.5.75.75 0 000 1.5zm10.5 0a.75.75 0 100-1.5.75.75 0 000 1.5z"
              />
            </svg>
          </button>

          {/* Separator */}
          <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-grey-200" aria-hidden="true" />

          {/* Profile dropdown */}
          <div className="relative">
            <button
              type="button"
              className="-m-1.5 flex items-center p-1.5"
              onClick={() => setUserMenuOpen(!userMenuOpen)}
            >
              <span className="sr-only">Open user menu</span>
              <UserAvatar
                name={userName}
                avatarUrl={avatarUrl}
                size={32}
              />
              <span className="hidden lg:flex lg:items-center">
                <span className="ml-4 text-sm font-semibold leading-6 text-grey-900" aria-hidden="true">
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
                  <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                </svg>
              </span>
            </button>

            {/* Dropdown menu */}
            {userMenuOpen && (
              <div className="absolute right-0 z-10 mt-2.5 w-40 origin-top-right rounded-md bg-white py-2 px-2 shadow-lg ring-1 ring-grey-900/5 focus:outline-none">
                <a href="/client/profile" className="block px-3! py-2! text-sm! font-medium! leading-6! text-grey-900! hover:bg-grey-100! rounded-md! mb-1!">
                  Your Profile
                </a>
                <button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className={cn(
                    "block w-full text-left px-3! py-2! text-sm! leading-6! rounded-md! transition-colors duration-200",
                    isLoggingOut 
                      ? "text-grey-500! bg-grey-50! cursor-not-allowed" 
                      : "text-grey-900! hover:bg-grey-100! hover:cursor-pointer!"
                  )}
                >
                  {isLoggingOut ? (
                    <span className="flex items-center">
                      <svg
                        className="h-4 w-4 mr-2 animate-spin"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Signing out
                      <span className="ml-1 flex">
                        <span className="animate-bounce" style={{ animationDelay: '0ms' }}>.</span>
                        <span className="animate-bounce" style={{ animationDelay: '150ms' }}>.</span>
                        <span className="animate-bounce" style={{ animationDelay: '300ms' }}>.</span>
                      </span>
                    </span>
                  ) : (
                    'Sign out'
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}