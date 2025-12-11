"use client";

import { AuthFormProvider, useAuthForm } from "./auth-form-context";
import GetStartedLineItem from "../../ui/components/purchase/get-started-line-item";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { fetchServiceBySlug } from "@/sanity/lib/queries/services";
import "react-toastify/dist/ReactToastify.css";

export default function AuthLayoutClient({ children }: { children: React.ReactNode }) {
  return (
    <AuthFormProvider>
      <LayoutContent>{children}</LayoutContent>
    </AuthFormProvider>
  );
}

function LayoutContent({ children }: { children: React.ReactNode }) {
  const { formType } = useAuthForm();
  const searchParams = useSearchParams();
  const serviceSlug = searchParams.get("service");
  const [service, setService] = useState<any | null>(null);

  useEffect(() => {
    if (serviceSlug) {
      fetchServiceBySlug(serviceSlug).then(setService);
    }
  }, [serviceSlug]);

  // Helper to format price
  const formatPrice = (cents: number, currency: string) =>
    cents ? `$${(cents / 100).toFixed(2)}` : undefined;

  return (
    <div className="w-full min-h-screen">
      {/* Top header section - only visible on mobile */}
      <div className="lg:hidden relative pt-20">
        {/* Mobile: dynamic purchase text and line item */}
        <div className="flex flex-col items-center justify-center bg-grey-700 bg-opacity-30 py-6 mx-auto my-6 max-w-[570px] rounded-xl shadow-md w-full px-4">
          <h2 className="text-xl font-semibold text-white text-center mb-6">
            {formType === "signup" ? "Signup to purchase" : "Login to purchase"}
          </h2>
          {service ? (
            <GetStartedLineItem
              itemName={service.title}
              itemDescription={service.shortDescription}
              itemImageUrl={service.image?.asset?.url || "/logo-stamp.png"}
              price={formatPrice(service.priceCents, service.currency)}
            />
          ) : (
            <GetStartedLineItem
              itemName="Strength Starter Pack"
              itemDescription="Kick off your journey with our starter program, including personalized coaching and resources."
              itemImageUrl="/assets/bench-press.json"
              price="$49.99"
            />
          )}
        </div>
      </div>

      {/* Main content grid - desktop layout */}
      <div className="grid lg:grid-cols-2 w-full min-h-screen">
        {/* Left side - desktop: show selected purchase item */}
        <div className="hidden lg:flex lg:flex-col lg:items-center w-full min-h-screen">
          <div className="w-full h-full relative flex justify-center items-start min-h-[800px] lg:min-h-[900px]">
            <img
              src='/home-testimonials-bg.webp'
              alt='Background'
              className='absolute inset-0 w-full h-full object-cover opacity-50 z-1'
            />
            <div className="absolute inset-0 mx-4 flex flex-col items-center pt-52 bg-grey-700 bg-opacity-30">
              <div className="flex flex-col items-center w-full">
                {/* Dynamic text directly above the line item */}
                <h2 className="text-2xl font-semibold text-white text-center mb-8">
                  {formType === "signup" ? "Signup to purchase" : "Login to purchase"}
                </h2>
                {service ? (
                  <GetStartedLineItem
                    itemName={service.title}
                    itemDescription={service.shortDescription}
                    itemImageUrl={service.image?.asset?.url || "/logo-stamp.png"}
                    price={formatPrice(service.priceCents, service.currency)}
                  />
                ) : (
                  <GetStartedLineItem
                    itemName="Strength Starter Pack"
                    itemDescription="Kick off your journey with our starter program, including personalized coaching and resources."
                    itemImageUrl="/assets/bench-press.json"
                    price="$49.99"
                  />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right side - form */}
        <div className="relative flex flex-col items-center justify-start lg:justify-start bg-transparent rounded-t-[50px] lg:rounded-none min-h-screen lg:bg-white lg:py-8">
          {/* Layer 3 */}
          <div className="lg:hidden absolute -top-6 left-0 right-0 bottom-0 bg-gold-300 max-w-[535px] mx-auto rounded-t-[50px] z-1" style={{ minHeight: 'calc(100vh + 100px)' }}></div>
          {/* Layer 2 */}
          <div className="lg:hidden absolute -top-3 left-0 right-0 bottom-0 bg-gold-500 max-w-[525px] mx-auto rounded-t-[50px] z-2" style={{ minHeight: 'calc(100vh + 100px)' }}></div>
          {/* Layer 1 */}
          <div className="relative w-full bg-white max-w-[515px] lg:max-w-none rounded-t-[50px] lg:rounded-none z-10 min-h-full lg:min-h-[800px] lg:min-h-[900px] pt-0 lg:pt-8 lg:pb-8">
            <div className="lg:px-8 lg:px-12 xl:px-16 pt-8 lg:pt-32">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}