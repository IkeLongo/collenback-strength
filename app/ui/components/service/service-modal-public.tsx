"use client";

import { useRouter } from "next/navigation";
import ServiceModalUI from "./service-modal-ui";

export default function ServiceModalPublic({
  selectedService,
  setSelectedService,
}: {
  selectedService: any | null;
  setSelectedService: (s: any | null) => void;
}) {
  const router = useRouter();

  return (
    <ServiceModalUI
      selectedService={selectedService}
      setSelectedService={setSelectedService}
      primaryLabel="Get Started"
      onPrimaryAction={(service) => {
        router.push(`/get-started?serviceId=${encodeURIComponent(service._id)}`);
      }}
      showStripeBadge={true}
    />
  );
}
