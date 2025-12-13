"use client";

import { useState } from "react";
import { Modal } from "@/app/ui/components/modal/programs-modal";
import ProgramsPageInner from "@/app/ui/components/program/programs-page-inner";

export default function ProgramsClient({
  categories,
  servicesByCategory,
  categoryTitles,
}: {
  categories: string[];
  servicesByCategory: Record<string, any[]>;
  categoryTitles: Record<string, string>;
}) {
  const [selectedService, setSelectedService] = useState<any | null>(null);

  return (
    <Modal>
      <ProgramsPageInner
        categories={categories}
        servicesByCategory={servicesByCategory}
        categoryTitles={categoryTitles}
        selectedService={selectedService}
        setSelectedService={setSelectedService}
      />
    </Modal>
  );
}
