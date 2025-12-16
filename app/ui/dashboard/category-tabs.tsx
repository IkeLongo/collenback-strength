"use client";

import { useMemo, useState } from "react";
import type { LineItem } from "./line-item";
import TypeTabs from "./type-tabs";

export type CategoryKey = "in_person" | "online" | "program" | "nutrition";

const LABEL: Record<CategoryKey, string> = {
  in_person: "In-Person",
  online: "Online",
  program: "Programs",
  nutrition: "Nutrition",
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
      <div className="bg-white rounded-2xl border border-grey-200 shadow-sm py-2 px-4 w-fit">
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
                  <span>{LABEL[k]}</span>
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

      {/* Type tabs second */}
      <TypeTabs
        items={filteredByCategory}
        title={`${title} • ${LABEL[category]}`}
        initialKind="membership"
        showOwnCard={false} // optional (see note below)
      />
    </div>
  );
}
