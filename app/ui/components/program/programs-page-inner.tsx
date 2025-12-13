"use client";

import { useModal } from "@/app/ui/components/modal/programs-modal";
import CategoryCard from "@/app/ui/components/program/programs-row";
import ServiceModalClient from "@/app/ui/components/service/service-modal-client";

export default function ProgramsPageInner({
  categories,
  servicesByCategory,
  categoryTitles,
  setSelectedService,
  selectedService,
}: {
  categories: string[];
  servicesByCategory: Record<string, any[]>;
  categoryTitles: Record<string, string>;
  setSelectedService: (s: any) => void;
  selectedService: any;
}) {
  const { setOpen } = useModal();

  return (
    <>
      <div className="w-full overflow-x-hidden">
        <h1 className="!text-xl sm:!text-2xl !font-bold !text-grey-600">
          Purchase a Program or Coaching
        </h1>
        <p className="!text-grey-500 !text-sm sm:!text-base !mb-6">
          Browse and manage your available programs and coaching options.
        </p>

        {categories.map(
          (cat) =>
            servicesByCategory[cat]?.length > 0 && (
              <CategoryCard
                key={cat}
                title={categoryTitles[cat]}
                services={servicesByCategory[cat]}
                onServiceClick={(service: any) => {
                  setSelectedService(service);
                  setOpen(true);
                }}
              />
            )
        )}
      </div>

      <ServiceModalClient
        selectedService={selectedService}
        setSelectedService={setSelectedService}
      />
    </>
  );
}