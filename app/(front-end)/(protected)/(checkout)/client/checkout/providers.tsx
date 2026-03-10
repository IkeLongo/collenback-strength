"use client";

import React from "react";
import Cart from "@/app/components/ui/stripe/cart";
import { CartDrawerProvider } from "@/app/components/ui/cart/cart-drawer-context";

export default function CheckoutProviders({ children }: { children: React.ReactNode }) {
  return (
    <CartDrawerProvider>
      <Cart>{children}</Cart>
    </CartDrawerProvider>
  );
}
