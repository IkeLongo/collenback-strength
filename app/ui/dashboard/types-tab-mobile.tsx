"use client";

import { useMemo, useState } from "react";
import type { LineItem } from "./line-item";
import LineItems from "./line-item";
import { TypeSelect, type KindKey } from "../components/select/type";

export default function TypeTabsMobile({
  items,
  title,
  initialKind = "membership",
}: {
  items: LineItem[];
  title: string;
  initialKind?: KindKey;
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

  return (
    <div className="space-y-3 bg-white rounded-2xl p-4 border border-grey-200 shadow-sm">
      <TypeSelect value={kind} onChange={setKind} counts={counts} />
      <LineItems items={filteredByKind} title={title} />
    </div>
  );
}
