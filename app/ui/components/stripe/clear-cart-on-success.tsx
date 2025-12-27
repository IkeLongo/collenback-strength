"use client";

import { useEffect } from "react";
import { useShoppingCart } from "use-shopping-cart";

export default function ClearCartOnSuccess({
  shouldClear,
}: {
  shouldClear: boolean;
}) {
  const { clearCart } = useShoppingCart();

  useEffect(() => {
    if (shouldClear) clearCart();
  }, [shouldClear, clearCart]);

  return null;
}
