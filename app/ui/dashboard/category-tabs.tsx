"use client";

import { useMemo, useState, useEffect } from "react";
import { Dumbbell, Laptop, ListChecks, Salad } from "lucide-react";
import type { LineItem } from "@/app/types/entitlements";
import TypeTabs from "./type-tabs";
import ProgramCards from "./program-cards";

export type CategoryKey = "in_person" | "online" | "program" | "nutrition";

const LABEL: Record<CategoryKey, string> = {
  in_person: "In-Person Coaching",
  online: "Online Coaching",
  program: "Programs",
  nutrition: "Nutrition Coaching",
};

const ICON: Record<CategoryKey, React.ReactNode> = {
  in_person: <Dumbbell size={16} className="mr-1.5" />,
  online: <Laptop size={16} className="mr-1.5" />,
  program: <ListChecks size={16} className="mr-1.5" />,
  nutrition: <Salad size={16} className="mr-1.5" />,
};

export default function CategoryTabs({
  items,
  title = "Your Services",
  initialCategory = "in_person",
}: {
  items: LineItem[];
  title?: string;
  initialCategory?: CategoryKey;
}) {
  const [category, setCategory] = useState<CategoryKey>(initialCategory);

  const counts = useMemo(() => {
    const c: Record<CategoryKey, number> = {
      in_person: 0,
      online: 0,
      program: 0,
      nutrition: 0,
    };

    for (const i of items) {
      const k = (i.service_category ?? "all") as CategoryKey;
      if (k in c) c[k] += 1;
    }
    return c;
  }, [items]);

  const filteredByCategory = useMemo(
    () => items.filter((i) => i.service_category === category),
    [items, category]
  );

  return (
    <div className="space-y-3">
      {/* Category tabs */}
      <div className="bg-white rounded-2xl border border-grey-200 shadow-sm py-2 px-4 pb-3 w-fit">
        <div className="flex">
          {(Object.keys(LABEL) as CategoryKey[]).map((k) => {
            const active = k === category;
            return (
              <div
                key={k}
                className={[
                  "flex items-center px-3 py-1.5 border-b-[2px] border-b-grey-100 text-sm transition",
                  active
                    ? "border-b-[3px] border-b-grey-500"
                    : "bg-grey-50 text-grey-700 hover:text-grey-900",
                ].join(" ")}
              >
                <button
                  onClick={() => setCategory(k)}
                  className={[
                    "flex items-center gap-2 rounded-full px-3 py-1.5 text-sm transition",
                    active
                      ? "text-grey-700 font-semibold!"
                      : "bg-grey-50 text-grey-700 hover:text-grey-900",
                  ].join(" ")}
                >
                  <span className="flex items-center gap-1">
                    {ICON[k]}
                    {LABEL[k]}
                  </span>
                  <span
                    className={[
                      "text-xs px-2 py-0.5 rounded-full",
                      active ? "text-blue-700 font-semibold! bg-blue-50" : "text-grey-700 bg-grey-100",
                    ].join(" ")}
                  >
                    {counts[k]}
                  </span>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Second-level content */}
      {category === "program" ? (
        <ProgramCards
          items={filteredByCategory}
          title={`${title} • ${LABEL[category]}`}
        />
      ) : (
        <TypeTabs
          items={filteredByCategory}
          title={`${title} • ${LABEL[category]}`}
          initialKind="membership"
          showOwnCard={false}
        />
      )}
    </div>
  );
}
