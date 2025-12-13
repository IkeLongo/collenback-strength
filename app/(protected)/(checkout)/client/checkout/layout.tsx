// A focused, minimal layout for the checkout flow
import React from "react";
import CheckoutProviders from "./providers";

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  return <CheckoutProviders>{children}</CheckoutProviders>;
}
 