"use client";

import { useState } from "react";
import { Modal } from "@/app/ui/components/modal/programs-modal";
import AdminProgramsInner from "./admin-programs-inner";

export default function AdminPrograms({
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
      <AdminProgramsInner
        categories={categories}
        servicesByCategory={servicesByCategory}
        categoryTitles={categoryTitles}
        selectedService={selectedService}
        setSelectedService={setSelectedService}
      />
    </Modal>
  );
}
