"use client";

import { useMemo, useState } from "react";
import { CategorySelect, type CategoryKey } from "../components/select/categories";
import type { LineItem } from "@/app/types/entitlements";
import TypeTabsMobile from "./types-tab-mobile";
import ProgramCards from "./program-cards";

const LABEL: Record<CategoryKey, string> = {
  in_person: "In-Person Coaching",
  online: "Online Coaching",
  program: "Programs",
  nutrition: "Nutrition Coaching",
};

export default function CategoryTabsMobileSelect({
  items,
  title = "Your Services",
  initialCategory = "in_person",
}: {
  items: LineItem[];
  title?: string;
  initialCategory?: CategoryKey;
}) {
  const [category, setCategory] = useState<CategoryKey>(initialCategory);

  const filteredByCategory = useMemo(
    () => items.filter((i) => i.service_category === category),
    [items, category]
  );

  return (
    <div className="space-y-3">
      <div className="bg-white rounded-2xl border border-grey-200 shadow-sm p-3 max-w-94">
        <CategorySelect value={category} onChange={setCategory} />
      </div>

      {category === "program" ? (
        <ProgramCards
          items={filteredByCategory}
          title={`${title} • ${LABEL[category]}`}
        />
      ) : (
        <TypeTabsMobile
          items={filteredByCategory}
          title={`${title} • ${LABEL[category]}`}
          initialKind="membership"
        />
      )}
    </div>
  );
}
