"use client";

import React from "react";
import Cart from "@/app/ui/components/stripe/cart";
import { CartDrawerProvider } from "@/app/ui/components/cart/cart-drawer-context";

export default function CheckoutProviders({ children }: { children: React.ReactNode }) {
  return (
    <CartDrawerProvider>
      <Cart>{children}</Cart>
    </CartDrawerProvider>
  );
}
