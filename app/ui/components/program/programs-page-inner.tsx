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
        <h1 className="text-xl! font-semibold! text-grey-700! normal-case!">
          Purchase a Program or Coaching Session
        </h1>
        <p className="text-sm! text-grey-500! mb-6">
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