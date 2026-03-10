"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import "./ui-legal.css";

type TocItem = {
  id: string;
  text: string;
  level: 2 | 3;
};

export default function LegalToc({
  containerSelector = ".legal",
  className,
}: {
  containerSelector?: string;
  className?: string;
}) {
  const [items, setItems] = useState<TocItem[]>([]);

  useEffect(() => {
    const container = document.querySelector(containerSelector);
    if (!container) return;

    const headings = Array.from(container.querySelectorAll("h2, h3")) as HTMLHeadingElement[];

    const next = headings
      .map((h) => {
        const id = h.id?.trim();
        const text = h.textContent?.trim() ?? "";
        const level = h.tagName === "H2" ? (2 as const) : (3 as const);

        if (!id || !text) return null;
        return { id, text, level };
      })
      .filter(Boolean) as TocItem[];

    setItems(next);
  }, [containerSelector]);

  if (items.length === 0) return null;

  return (
    <div className={cn("legal bg-white border border-slate-200 rounded-2xl shadow-sm p-6", className)}>
      <p className="font-semibold text-slate-900 mb-3">Table of Contents</p>
      <ul className="space-y-2">
        {items.map((item) => (
          <li key={item.id} className={cn(item.level === 3 && "pl-4")}>
            <a className="text-slate-700 hover:text-slate-900 underline-offset-4 hover:underline" href={`#${item.id}`}>
              {item.text}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}