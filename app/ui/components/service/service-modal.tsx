"use client";

import React, { useEffect } from "react";
import { ModalBody, useModal } from "@/app/ui/components/modal/programs-modal";
import flexedBiceps from "@/public/assets/flexed-biceps.json";
import stripeLottie from "@/public/assets/stripe.json";
import Lottie from "lottie-react";
import { useShoppingCart } from "use-shopping-cart";
// import { useRouter } from "next/navigation";

export default function ServiceModal({
  selectedService,
  setSelectedService,
}: {
  selectedService: any;
  setSelectedService: (s: any) => void;
}) {
  const { open, setOpen } = useModal();
  const { addItem } = useShoppingCart();
  // const router = useRouter();

  const formatPrice = (cents: number, currency: string) =>
    cents
      ? (cents / 100).toLocaleString(undefined, {
          style: "currency",
          currency,
        })
      : "Contact for pricing";

  useEffect(() => {
    if (!open && selectedService) setSelectedService(null);
  }, [open, selectedService, setSelectedService]);

  // const handleGetStarted = () => {
  //   const serviceSlug = selectedService.slug?.current || selectedService._id;
  //   router.push(`/get-started?service=${serviceSlug}`);
  //   setOpen(false);
  // };

  if (!selectedService) return null;

  const imageUrl = selectedService.image?.asset?.url || "/logo-stamp.png";

  const handleAddToCart = () => {
    // Build the object that use-shopping-cart expects
    addItem({
      id: selectedService._id,
      name: selectedService.title,
      price: selectedService.priceCents ?? 0, // cents
      currency: (selectedService.currency || "USD").toLowerCase(),
      image: imageUrl,
      // optional fields:
      sku: selectedService.stripePriceId || null,
    });

    // close modal after add
    setOpen(false);
  };

  return (
    <ModalBody className="p-0! max-w-2xl! w-full!">
      <div
        className="
          group
          relative
          w-full!
          max-h-[85vh]!
          overflow-hidden!
          rounded-2xl!
          bg-white!
          border!
          border-grey-200!
          shadow-xl!
          flex!
          flex-col!
        "
      >
        {/* IMAGE HEADER */}
        <div className="relative h-56! sm:h-64! w-full! overflow-hidden!">
          <div className="absolute inset-0 transition-transform! duration-500! group-hover:scale-105!">
            <img
              src={imageUrl}
              alt={selectedService.title}
              className="h-full! w-full! object-cover!"
            />
            {/* same overlay style as cards */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent!" />
          </div>

          {/* Title overlay on image (optional but looks premium) */}
          <div className="absolute bottom-4 left-4 right-4">
            <h2 className="text-2xl! sm:text-3xl! font-extrabold! text-white! drop-shadow-lg! leading-tight!">
              {selectedService.title}
            </h2>
            {selectedService.shortDescription && (
              <p className="mt-1! text-sm! sm:text-base! text-white/90! drop-shadow! line-clamp-2!">
                {selectedService.shortDescription}
              </p>
            )}
          </div>
        </div>

        {/* BODY */}
        <div className="flex flex-col flex-1 p-5! sm:p-6! gap-4!">
          {/* Price + meta row */}
          <div className="flex! items-center! justify-between! gap-3! -my-6">
            {/* Left: Price and Sessions */}
            <div className="flex! items-center! gap-2! flex-wrap!">
              <span className="text-gold-600! font-semibold! text-base! sm:text-lg!">
                {formatPrice(selectedService.priceCents, selectedService.currency || "USD")}
              </span>
              {selectedService.sessionsIncluded && (
                <span className="text-xs! bg-grey-100! text-grey-700! px-2! py-1! rounded-full! font-medium!">
                  {selectedService.sessionsIncluded} sessions
                </span>
              )}
            </div>
            {/* Right: Stripe Lottie Animation */}
            <div className="w-24 h-20 flex items-center justify-center">
              <Lottie animationData={stripeLottie} loop={false} className="w-full h-full" />
            </div>
          </div>

          {/* Long description (scrollable if long) */}
          <div className="flex-1! overflow-y-auto! pr-1!">
            <div className="space-y-3!">
              {selectedService.longDescription?.length ? (
                selectedService.longDescription.map((block: any) =>
                  block.children?.map((child: any) => (
                    <p key={child._key} className="m-0! text-sm! sm:text-base! text-grey-700! leading-relaxed!">
                      {child.text}
                    </p>
                  ))
                )
              ) : (
                <p className="text-grey-500!">
                  No additional details provided.
                </p>
              )}
            </div>
          </div>

          {/* CTA pinned to bottom */}
          {/* Get Started button at the bottom */}
            <div className="mt-8 flex justify-center relative">
              <button
                type="button"
                className="bg-black text-white font-bold! flex justify-center group/modal-btn px-6 py-3 rounded-lg font-semibold text-lg relative overflow-hidden"
                onClick={handleAddToCart}
              >
                <span className="group-hover/modal-btn:translate-x-40 text-center transition duration-500">
                  Add to Cart
                </span>
                <div className="-translate-x-40 group-hover/modal-btn:translate-x-0 flex items-center justify-center absolute inset-0 transition duration-500 text-white z-20">
                  <Lottie animationData={flexedBiceps} loop={true} className="w-24 h-24" />
                </div>
              </button>
            </div>
        </div>
      </div>
    </ModalBody>
  );
}
