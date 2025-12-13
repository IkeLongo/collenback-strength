"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useShoppingCart } from "use-shopping-cart";
import { fetchPostJSON } from "@/app/utils/api-helpers";

export default function OrderSummary() {
  const [loading, setLoading] = useState(false);

  const { formattedTotalPrice, cartCount, cartDetails, clearCart } =
    useShoppingCart();

  const cartEmpty = !cartCount;

  const cartItems = useMemo(() => {
    const items = Object.values(cartDetails ?? {});
    return items.map((i: any) => ({ id: i.id, quantity: i.quantity }));
  }, [cartDetails]);

  const handleCheckout = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (cartEmpty || loading) return;

    setLoading(true);
    try {
      const response = await fetchPostJSON<{ id: string; url: string }>(
        "/api/checkout_sessions",
        cartItems
      );

      if (!response?.url) {
        console.error("No Checkout URL returned:", response);
        setLoading(false);
        return;
      }

      window.location.assign(response.url);
    } catch (err) {
      console.error("Checkout error:", err);
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-grey-200 bg-white shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-grey-200">
        <h2 className="text-lg! font-extrabold! text-grey-900!">
          Order Summary
        </h2>
        <p className="text-sm! text-grey-500!">
          {cartCount ? `${cartCount} item(s)` : "Cart is empty"}
        </p>
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Total */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm! text-grey-500!">Total</span>
          <span className="text-base! font-extrabold! text-grey-900!">
            {formattedTotalPrice}
          </span>
        </div>

        {/* Checkout */}
        <form onSubmit={handleCheckout} className="space-y-3">
          <button
            type="submit"
            disabled={cartEmpty || loading}
            className="
              w-full
              rounded-xl
              bg-green-700
              text-white
              py-2
              font-bold!
              text-base
              shadow-md
              transition
              hover:shadow-xl
              hover:-translate-y-0.5
              disabled:opacity-50
              disabled:cursor-not-allowed
            "
          >
            {loading ? "Starting checkout..." : "Proceed to Checkout"}
          </button>

          {/* Secondary actions */}
          <button
            type="button"
            onClick={clearCart}
            disabled={cartEmpty || loading}
            className="
              w-full
              rounded-xl
              border
              border-grey-200
              py-2
              text-sm
              font-semibold
              text-grey-700
              hover:bg-grey-50
              transition
              disabled:opacity-50
              disabled:cursor-not-allowed
            "
          >
            Clear cart
          </button>
        </form>

        {/* Helper text */}
        <p className="mt-3 text-xs! text-grey-500! text-center">
          Secure checkout powered by{" "}
          <span className="font-semibold! text-grey-700!">Stripe</span>.
        </p>

        {/* Test card hint (optional) */}
        <div className="mt-3 rounded-xl border border-grey-200 bg-grey-50 px-3 py-2">
          <p className="text-xs! text-grey-600!">
            Test card: <span className="font-semibold!">4242 4242 4242 4242</span>
          </p>
        </div>

        {/* Continue shopping */}
        <Link href="/client/programs" className="block mt-4">
          <span className="block w-full text-center rounded-xl border border-grey-200 py-2 text-sm font-semibold text-grey-700 hover:bg-grey-50 transition">
            Continue shopping
          </span>
        </Link>
      </div>
    </div>
  );
}
