"use client";

import React from "react";
import Link from "next/link";
import CartLineItems from "@/app/ui/components/stripe/cart-line-items";
import OrderSummary from "@/app/ui/components/stripe/order-summary";

export default function CheckoutClient() {
  return (
    <main className="w-full max-w-6xl mx-auto px-3 sm:px-6 py-6 sm:py-10">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl! sm:text-3xl! font-extrabold! text-gold-600!">
          Checkout
        </h1>
        <p className="text-grey-300! text-sm! sm:text-base! mt-1!">
          Review your items and complete your purchase.
        </p>
      </div>

      {/* Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left: line items */}
        <div className="lg:col-span-2">
          <CartLineItems />
        </div>

        {/* Right: order summary card */}
        <div className="lg:col-span-1">
          <OrderSummary />
        </div>
      </div>

      {/* Footer link */}
      <div className="mt-8">
        <Link href="/client/dashboard">
          <span className="text-sm! text-grey-200! underline cursor-pointer flex items-center gap-1">
            <svg className="inline h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </span>
        </Link>
      </div>
    </main>
  );
}

