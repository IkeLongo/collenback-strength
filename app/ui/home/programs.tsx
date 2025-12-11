"use client";
import React, { useEffect, useState } from "react";
import { Tabs } from "@/app/ui/components/tabs/tabs";
import FadeInUp from "../components/fade/fade-in-up";
import {
  ModalProvider,
  ModalBody,
  ModalContent,
  ModalTrigger,
  useModal,
} from "../components/modal/programs-modal";
import Lottie from "lottie-react";
import { useRouter } from "next/navigation";
import flexedBiceps from "@/public/assets/flexed-biceps.json";
import { fetchServiceCategories } from "@/sanity/lib/queries/categories";
import { fetchAllServices } from "@/sanity/lib/queries/services";

const CATEGORY_TITLES = {
  in_person: "In-Person Training",
  online: "Online Coaching",
  program: "Strength Programs",
  nutrition: "Nutrition Coaching",
};

// Remove sample data, will fetch from Sanity

export default function ProgramsTabs() {
  const [categories, setCategories] = useState<string[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [selectedService, setSelectedService] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchServiceCategories(), fetchAllServices()]).then(([cats, servs]) => {
      setCategories(cats);
      setServices(servs);
      setLoading(false);
    });
  }, []);

  const tabs = categories.map((cat) => ({
    title: CATEGORY_TITLES[cat as keyof typeof CATEGORY_TITLES] || cat,
    value: cat,
    content: (
      <section className="flex flex-col w-full max-w-[450px] md:max-w-[834px] lg:max-w-[1220px] mx-auto px-8 py-16 pb-20 md:py-18 lg:py-16 bg-grey-900 rounded-2xl shadow-lg relative">
        <div className="flex flex-col items-center text-center">
          <h3 className="text-white font-bold! text-3xl! lg:text-4xl! font-oxanium! mb-4">
            {CATEGORY_TITLES[cat as keyof typeof CATEGORY_TITLES] || cat}
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
          {services
            .filter((service) => service.category === cat)
            .map((service) => (
              <ServiceCard
                key={service._id}
                service={service}
                setSelectedService={setSelectedService}
              />
            ))}
        </div>
      </section>
    ),
  }));

  if (loading) return <div className="text-center py-20 text-white">Loading...</div>;

  return (
    <section id="programs" className="flex flex-col w-full mx-auto py-16 pb-4 md:py-18 md:pb-4 lg:py-24 lg:pb-10 px-4 md:px-8 lg:px-16">
      <FadeInUp>
        <div className="w-full flex flex-col items-center text-center mb-8 md:mb-12">
          <h3 className="text-white font-bold text-center pt-4 md:text-3xl lg:text-4xl font-outfit -mb-6 md:mb-4">
            COACHING PROGRAMS
          </h3>
        </div>
      </FadeInUp>
      <Tabs tabs={tabs} />
      {/* Modal for service details */}
      <ServiceModal selectedService={selectedService} setSelectedService={setSelectedService} />
    </section>
  );
}

// ServiceCard component to handle modal logic per card
function ServiceCard({ service, setSelectedService }: { service: any; setSelectedService: (s: any) => void }) {
  const { open, setOpen } = useModal();
  return (
    <div
      className="bg-grey-950 border border-grey-800 rounded-xl p-6 text-white shadow-lg transition-transform duration-200 hover:scale-[1.03] hover:border-gold-500 flex flex-col h-full group cursor-pointer"
      onClick={() => {
        setSelectedService(service);
        setOpen(true);
      }}
    >
      <h4 className="font-bold text-xl! lg:text-medium! mb-2 text-gold-500 font-outfit! tracking-wide">
        {service.title}
      </h4>
      {/* Render longDescription blocks as plain text for now */}
      <div className="mb-2 text-grey-200 text-[16px]!">
        {service.longDescription?.map((block: any, idx: number) =>
          block.children?.map((child: any) => (
            <p key={child._key} className="text-xl! lg:text-medium! leading-relaxed!">{child.text}</p>
          ))
        )}
      </div>
      <div className="mt-auto flex items-center gap-1">
        <span className="text-white group-hover:text-gold-500 font-semibold hover:underline transition-colors duration-150 font-outfit flex items-center">
          Learn More
          <svg className="ml-1 w-4 h-4 text-white group-hover:text-gold-500 transition-colors duration-150" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </span>
      </div>
    </div>
  );
}

// ServiceModal component to show modal for selected service
function ServiceModal({ selectedService, setSelectedService }: { selectedService: any; setSelectedService: (s: any) => void }) {
  const { open, setOpen } = useModal();
  const router = useRouter();
  if (!selectedService) return null;

  // Helper to format price
  const formatPrice = (cents: number, currency: string) =>
    cents ? `${(cents / 100).toLocaleString(undefined, { style: 'currency', currency })}` : 'Contact for pricing';

  // Handler for Get Started button
  const handleGetStarted = () => {
    // Use slug if available, fallback to _id
    const serviceSlug = selectedService.slug?.current || selectedService._id;
    router.push(`/get-started?service=${serviceSlug}`);
    setOpen(false);
  };

  return (
    <ModalBody>
      {open && (
        <ModalContent>
          <div className="relative flex flex-col! h-full! flex-1! bg-gradient-to-br! from-grey-950! via-grey-900! to-gold-500! rounded-2xl! shadow-2xl! border-4! border-gold-500! p-6! overflow-hidden! gap-y-3! justify-start!">
            {/* Decorative geometric shape */}
            <div className="absolute top-0 right-0 w-32! h-32! bg-gold-500! opacity-20! rounded-bl-full! pointer-events-none!" />
            {selectedService.image && (
              <img
                src={selectedService.image.asset?.url}
                alt={selectedService.title}
                className="w-full! max-h-48! object-cover! rounded-xl! mb-4! shadow-lg! border-2! border-gold-500!"
                style={{ transition: 'transform 0.3s', transform: 'scale(1.05)' }}
              />
            )}
            <h2 className="text-3xl! font-extrabold! mb-2! text-gold-500! font-[oxanium]! drop-shadow-lg! tracking-wide! animate-pulse">{selectedService.title}</h2>
            <div className="mb-2! text-grey-200! text-left! font-[outfit]! text-lg! italic!">{selectedService.shortDescription}</div>
            <div className="mb-2! text-white! font-bold! font-[outfit]! text-xl! flex! items-center! gap-2!">
              <span className="bg-gold-500! text-black! px-3! py-1! rounded-full! shadow-md!">
                {formatPrice(selectedService.priceCents, selectedService.currency || 'USD')}
              </span>
              {selectedService.sessionsIncluded && (
                <span className="bg-grey-800! text-gold-500! px-2! py-1! rounded-full! text-sm!">
                  {selectedService.sessionsIncluded} Sessions
                </span>
              )}
            </div>
            <div className="mb-4! text-grey-200! text-base! leading-relaxed!">
              {selectedService.longDescription?.map((block: any, idx: number) =>
                block.children?.map((child: any) => (
                  <p key={child._key} className="mb-2!">{child.text}</p>
                ))
              )}
            </div>
            {/* Stripe badge or other info */}
            {selectedService.stripePriceId && (
              <div className="mt-auto! text-xs! text-gold-500! bg-grey-900! px-2! py-1! rounded-lg! self-end!">
                Stripe Enabled
              </div>
            )}
            {/* Get Started button at the bottom */}
            <div className="mt-8 flex justify-center relative">
              <button
                type="button"
                className="bg-black dark:bg-white dark:text-black text-white flex justify-center group/modal-btn px-6 py-3 rounded-lg font-semibold text-lg relative overflow-hidden"
                onClick={handleGetStarted}
              >
                <span className="group-hover/modal-btn:translate-x-40 text-center transition duration-500">
                  Get Started
                </span>
                <div className="-translate-x-40 group-hover/modal-btn:translate-x-0 flex items-center justify-center absolute inset-0 transition duration-500 text-white z-20">
                  <Lottie animationData={flexedBiceps} loop={true} className="w-24 h-24" />
                </div>
              </button>
            </div>
          </div>
        </ModalContent>
      )}
    </ModalBody>
  );
}