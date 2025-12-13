"use client";

import React, { createContext, useContext, useState } from "react";

type CartDrawerCtx = {
  open: boolean;
  setOpen: (v: boolean) => void;
};

const CartDrawerContext = createContext<CartDrawerCtx | null>(null);

export function CartDrawerProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <CartDrawerContext.Provider value={{ open, setOpen }}>
      {children}
    </CartDrawerContext.Provider>
  );
}

export function useCartDrawer() {
  const ctx = useContext(CartDrawerContext);
  if (!ctx) throw new Error("useCartDrawer must be used within CartDrawerProvider");
  return ctx;
}
