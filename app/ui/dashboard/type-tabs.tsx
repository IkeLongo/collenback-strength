"use client";

import { useMemo, useState } from "react";
import { BadgeCheck, Ticket } from "lucide-react";
import type { LineItem } from "./line-item";
import LineItems from "./line-item";

type KindKey = "membership" | "pack";

const KIND_LABEL: Record<KindKey, string> = {
  membership: "Memberships",
  pack: "Packs",
};

const KIND_ICON: Record<KindKey, React.ReactNode> = {
  membership: <BadgeCheck size={16} className="mr-1.5" />,
  pack: <Ticket size={16} className="mr-1.5" />,
};

export default function TypeTabs({
  items,
  title,
  initialKind = "membership",
  showOwnCard = true,
}: {
  items: LineItem[];
  title: string;
  initialKind?: KindKey;
  showOwnCard?: boolean;
}) {
  const [kind, setKind] = useState<KindKey>(initialKind);

  const counts = useMemo(() => {
    let memberships = 0;
    let packs = 0;
    for (const i of items) {
      if (i.kind === "membership" && i.is_active) memberships++;
      if (i.kind === "pack" && Number(i.available_credits ?? 0) > 0) packs++;
    }
    return { memberships, packs };
  }, [items]);

  const filteredByKind = useMemo(
    () => items.filter((i) => i.kind === kind),
    [items, kind]
  );

  const tabs = (
    <div className="w-fit">
      <div className="flex">
        {(["membership", "pack"] as KindKey[]).map((k) => {
          const active = k === kind;
          const badge = k === "membership" ? counts.memberships : counts.packs;

          return (
            <div 
              className={[
                  "flex items-centerr px-3 py-1.5 border-b-[2px] border-b-grey-100 text-sm transition",
                  active
                    ? "border-b-[3px] border-b-grey-500"
                    : "bg-grey-50 text-grey-700 hover:text-grey-900",
                ].join(" ")}
              >
              <button
                key={k}
                onClick={() => setKind(k)}
                className={[
                  "flex items-center gap-2 rounded-full px-3 py-1.5 text-sm transition",
                  active
                    ? "text-grey-700 font-semibold!"
                    : "bg-grey-50 text-grey-700 hover:text-grey-900",
                ].join(" ")}
              >
                <span className="flex items-center">
                  {KIND_ICON[k]}
                  {KIND_LABEL[k]}
                </span>
                <span
                  className={[
                    "text-xs px-2 py-0.5 rounded-full",
                    active ? "text-blue-700 font-semibold! bg-blue-50" : "text-grey-700 bg-grey-100",
                  ].join(" ")}
                >
                  {badge}
                </span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="space-y-3 bg-white rounded-2xl p-4">
      {showOwnCard ? tabs : tabs}
      <LineItems items={filteredByKind} title={title} />
    </div>
  );
}