"use client";

import React, { useEffect, useRef } from "react";
import { useCartDrawer } from "./cart-drawer-context";
import { useShoppingCart } from "use-shopping-cart";
import CartSummary from "@/app/ui/components/stripe/order-summary";
import { cn } from "@/app/lib/utils";
import { useRouter } from "next/navigation";

export default function CartDrawer() {
  const { open, setOpen } = useCartDrawer();
  const { cartCount, cartDetails, clearCart, formattedTotalPrice, incrementItem, decrementItem, removeItem } =
  useShoppingCart();

  const router = useRouter();

  // lock body scroll
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [open]);

  // close on ESC
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [setOpen]);

  // click outside
  const panelRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!open) return;
      if (!panelRef.current) return;
      if (panelRef.current.contains(e.target as Node)) return;
      setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open, setOpen]);

  const items = Object.values(cartDetails ?? {});

  return (
    <div
      className={cn(
        "fixed inset-0 z-[60] pointer-events-none",
        open && "pointer-events-auto"
      )}
      aria-hidden={!open}
    >
      {/* Backdrop */}
      <div
        className={cn(
          "absolute inset-0 bg-black/40 opacity-0 transition-opacity duration-200",
          open && "opacity-100"
        )}
      />

      {/* Panel */}
      <div
        ref={panelRef}
        className={cn(
          "absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl border-l border-grey-200",
          "translate-x-full transition-transform duration-250 ease-out",
          open && "translate-x-0"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-grey-200">
          <div>
            <h2 className="text-lg! font-extrabold! text-grey-900!">Your Cart</h2>
            <p className="text-sm! text-grey-500!">
              {cartCount ? `${cartCount} item(s)` : "Cart is empty"}
            </p>
          </div>

          <button
            onClick={() => setOpen(false)}
            className="rounded-lg px-2 py-1 text-grey-500 hover:text-grey-900 transition"
            aria-label="Close cart"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-4 overflow-y-auto h-[calc(100%-250px)]">
          {items.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-grey-500!">No items yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((item: any) => (
                <div
                  key={item.id}
                  className="
                    flex
                    items-center
                    gap-3
                    rounded-2xl
                    border
                    border-grey-200
                    bg-white
                    p-3
                    shadow-sm
                  "
                >
                  {/* Image */}
                  <img
                    src={item.image || "/logo-stamp.png"}
                    alt={item.name}
                    className="h-14 w-14 rounded-xl object-cover border border-grey-200 bg-grey-700 p-2"
                  />

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm! font-semibold! text-grey-900! line-clamp-2!">
                      {item.name}
                    </p>

                    {/* Quantity controls */}
                    <div className="mt-2 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => decrementItem(item.id)}
                        className="
                          h-8 w-8
                          rounded-lg
                          border border-grey-200
                          text-grey-700
                          hover:bg-grey-50
                          transition
                        "
                        aria-label="Decrease quantity"
                      >
                        −
                      </button>

                      <span className="text-sm! font-semibold! text-grey-700! w-6 text-center">
                        {item.quantity}
                      </span>

                      <button
                        type="button"
                        onClick={() => incrementItem(item.id)}
                        className="
                          h-8 w-8
                          rounded-lg
                          border border-grey-200
                          text-grey-700
                          hover:bg-grey-50
                          transition
                        "
                        aria-label="Increase quantity"
                      >
                        +
                      </button>

                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        className="ml-2 text-xs! font-semibold! text-grey-500! hover:text-red-600! transition"
                      >
                        Remove
                      </button>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="flex flex-col items-end gap-1">
                    <p className="text-sm! font-bold! text-black!">
                      {item.formattedValue}
                    </p>
                    <p className="text-xs! text-grey-400!">
                      {item.quantity > 1 ? "Total" : "Each"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-grey-200">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm! text-grey-500!">Total</span>
            <span className="text-base! font-extrabold! text-grey-900!">
              {formattedTotalPrice}
            </span>
          </div>

          {/* Go to Checkout */}
          <button
            type="button"
            onClick={() => {
              setOpen(false); // close drawer
              router.push("/client/checkout");
            }}
            disabled={items.length === 0}
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
            Proceed to Checkout
          </button>

          {/* Reuse your existing checkout flow */}
          {/* <CartSummary /> */}

          <button
            type="button"
            onClick={clearCart}
            className="mt-3 w-full rounded-xl border border-grey-200 py-2 text-sm font-semibold text-grey-700 hover:bg-grey-50 transition"
          >
            Clear cart
          </button>
        </div>
      </div>
    </div>
  );
}
