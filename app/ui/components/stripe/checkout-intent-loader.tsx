"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useShoppingCart } from "use-shopping-cart";
import { fetchServiceById } from "@/sanity/lib/queries/services";

export default function CheckoutIntentLoader() {
  const searchParams = useSearchParams();
  const serviceId = searchParams.get("serviceId");

  const { addItem, cartDetails } = useShoppingCart();

  useEffect(() => {
    if (!serviceId) return;

    const key = `checkout_intent_added:${serviceId}`;

    // ✅ Hard guard across refresh + strict mode
    if (typeof window !== "undefined" && sessionStorage.getItem(key) === "1") {
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        console.log("serviceSlug from URL:", serviceId);

        const service = await fetchServiceById(serviceId);

        console.log("service fetched:", service);
        if (!service || cancelled) return;

        const itemId = service._id;
        const currency = (service.currency || "usd").toLowerCase();

        // ✅ Correct “already in cart” check (compare to the id you actually add)
        const alreadyInCart = Object.values(cartDetails ?? {}).some(
          (i: any) => i?.id === itemId
        );
        if (alreadyInCart) {
          if (typeof window !== "undefined") sessionStorage.setItem(key, "1");
          return;
        }

        addItem({
          id: itemId,
          name: service.title,
          price: service.priceCents ?? 0,
          currency,
          image: service.image?.asset?.url || "/logo-stamp.png",
          sku: service.stripePriceId || undefined,
        });

        if (typeof window !== "undefined") sessionStorage.setItem(key, "1");

        // Optional: remove the query param so future refreshes don't even try
        // window.history.replaceState({}, "", "/client/checkout");
      } catch (e) {
        console.error("Failed to load checkout intent:", e);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [serviceId, addItem, cartDetails]);

  return null;
}

