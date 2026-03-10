"use client";

import React from "react";
import type { ActivityItem } from "../dashboard-types";
import { formatDistanceToNowStrict } from "date-fns";

type Props = {
  items: ActivityItem[];
};

function timeAgo(iso: string) {
  try {
    return formatDistanceToNowStrict(new Date(iso), { addSuffix: true });
  } catch {
    return "";
  }
}

function badgeFor(kind: ActivityItem["kind"]) {
  switch (kind) {
    case "session_booked":
      return { text: "Booked", cls: "bg-lime-100 text-lime-900 border-lime-200" };
    case "session_canceled":
      return { text: "Canceled", cls: "bg-rose-100 text-rose-900 border-rose-200" };
    case "purchase_completed":
      return { text: "Purchase", cls: "bg-sky-100 text-sky-900 border-sky-200" };
    default:
      return { text: "Activity", cls: "bg-grey-100 text-grey-900 border-grey-200" };
  }
}

export function RecentActivity({ items }: Props) {
  return (
    <div className="rounded-2xl border border-grey-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-grey-200 px-4 py-3">
        <div className="text-sm font-semibold text-grey-900">Recent Activity</div>
      </div>

      {items.length === 0 ? (
        <div className="px-4 py-6 text-sm text-grey-600">No recent activity.</div>
      ) : (
        <ul className="divide-y divide-grey-200 max-h-80 overflow-y-auto">
          {items.map((it) => {
            const b = badgeFor(it.kind);
            return (
              <li key={it.id} className="px-4 py-3">
                <div className="flex items-start gap-3">
                  <span className={`mt-0.5 inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold ${b.cls}`}>
                    {b.text}
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <div className="truncate text-sm font-semibold text-grey-900">
                        {it.title}
                      </div>
                      <div className="shrink-0 text-xs text-grey-500">
                        {timeAgo(it.occurredAtUtc)}
                      </div>
                    </div>

                    {it.description ? (
                      <div className="mt-0.5 text-sm text-grey-600 line-clamp-2">
                        {it.description}
                      </div>
                    ) : null}

                    {it.href ? (
                      <a
                        href={it.href}
                        className="mt-1 inline-block text-xs! font-semibold! text-grey-700! underline underline-offset-4! hover:text-grey-900!"
                      >
                        View
                      </a>
                    ) : null}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
