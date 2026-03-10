"use client";

import React from "react";
import { useShoppingCart } from "use-shopping-cart";

export default function CartLineItems() {
  const { cartDetails, incrementItem, decrementItem, removeItem } = useShoppingCart();
  const items = Object.values(cartDetails ?? {});

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-grey-200 bg-white p-6 text-center">
        <p className="text-grey-500! text-sm!">Your cart is empty.</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-grey-200 bg-white shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-grey-200">
        <h2 className="text-lg! font-extrabold! text-grey-900!">Items</h2>
        <p className="text-sm! text-grey-500!">Review your selections before checkout.</p>
      </div>

      <div className="p-4 space-y-3">
        {items.map((item: any) => (
          <div
            key={item.id}
            className="flex items-center gap-3 rounded-2xl border border-grey-200 p-3"
          >
            <img
              src={item.image || "/logo-stamp.png"}
              alt={item.name}
              className="h-16 w-16 rounded-xl object-cover border border-grey-200 bg-grey-700 p-2"
            />

            <div className="flex-1 min-w-0">
              <p className="text-sm! font-semibold! text-grey-900! line-clamp-2!">
                {item.name}
              </p>

              <div className="mt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => decrementItem(item.id)}
                  className="h-8 w-8 rounded-lg border border-grey-200 text-grey-700 hover:bg-grey-50 transition"
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
                  className="h-8 w-8 rounded-lg border border-grey-200 text-grey-700 hover:bg-grey-50 transition"
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

            <div className="flex flex-col items-end gap-1">
              <p className="text-sm! font-extrabold! text-gold-600!">
                {item.formattedValue}
              </p>
              <p className="text-xs! text-grey-400!">
                {item.quantity > 1 ? "Total" : "Each"}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
