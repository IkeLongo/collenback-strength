
import { Suspense } from "react";
import CheckoutClient from "@/app/ui/components/stripe/checkout-client";

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="p-6">Loading checkout…</div>}>
      <CheckoutClient />
    </Suspense>
  );
}
