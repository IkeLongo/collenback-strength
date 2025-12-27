"use client";

import { useShoppingCart } from "use-shopping-cart";
import ServiceModalUI from "./service-modal-ui";

export default function ServiceModalClient({
  selectedService,
  setSelectedService,
}: {
  selectedService: any | null;
  setSelectedService: (s: any | null) => void;
}) {
  const { addItem } = useShoppingCart();

  return (
    <ServiceModalUI
      selectedService={selectedService}
      setSelectedService={setSelectedService}
      primaryLabel="Add to Cart"
      onPrimaryAction={(service) => {
        const imageUrl = service.image?.asset?.url || "/logo-stamp.png";
        addItem({
          id: service._id,
          name: service.title,
          price: service.priceCents ?? 0,
          currency: (service.currency || "usd").toLowerCase(),
          image: imageUrl,
          sku: service.stripePriceId || null,
        });
      }}
      showStripeBadge={true}
      enableAddToCart={true}
    />
  );
}
