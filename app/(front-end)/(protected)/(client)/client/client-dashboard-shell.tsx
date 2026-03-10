"use client";

import { useState } from "react";
import { ClientNavbar } from "@/app/components/layout/dashboard/client-navbar";
import { ClientSidebar } from "@/app/components/layout/dashboard/client-sidebar";
import Cart from "@/app/components/ui/stripe/cart";
import { CartDrawerProvider } from "@/app/components/ui/cart/cart-drawer-context";
import CartDrawer from "@/app/components/ui/cart/cart-drawer";

export default function ClientDashboardShell({
  children,
  userName,
}: {
  children: React.ReactNode;
  userName: string;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <CartDrawerProvider>
      <Cart>
        <div className="min-h-screen bg-grey-100">
          {/* Mobile sidebar */}
          <div className="lg:hidden">
            <ClientSidebar mobile sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
          </div>

          {/* Desktop sidebar */}
          <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
            <ClientSidebar />
          </div>

          <div className="w-full lg:pl-72">
            {/* Top navbar */}
            <ClientNavbar setSidebarOpen={setSidebarOpen} userName={userName} />

            {/* Main content */}
            <main className="w-full py-4 sm:py-6">
              <div className="w-full px-3 sm:px-4 md:px-6 lg:px-8">{children}</div>
            </main>
          </div>

          {/* Drawer mounted once for whole dashboard */}
          <CartDrawer />
        </div>
      </Cart>
    </CartDrawerProvider>
  );
}
