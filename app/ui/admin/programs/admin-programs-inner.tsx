"use client";

import { useModal } from "@/app/ui/components/modal/programs-modal";
import ServiceModalClient from "@/app/ui/components/service/service-modal-client";
import AdminProgramsRow from "./admin-programs-row";
import { useOptimistic } from "next-sanity/hooks";

export default function AdminProgramsInner({
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

  const optimisticServices = useOptimistic(
    servicesByCategory,
    (state, action: any) => {
      // Sanity sends {id, document}
      if (!action?.id || !action?.document) return state;

      const next = structuredClone(state);

      for (const cat of Object.keys(next)) {
        next[cat] = next[cat].map((s: any) =>
          s._id === action.id ? { ...s, ...action.document } : s
        );
      }

      return next;
    }
  );

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
            optimisticServices[cat]?.length > 0 && (
              <AdminProgramsRow
                key={cat}
                title={categoryTitles[cat]}
                services={optimisticServices[cat]}
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