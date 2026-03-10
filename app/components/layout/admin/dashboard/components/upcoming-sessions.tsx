"use client";

import React from "react";
import type { SessionListItem } from "../dashboard-types";
import { formatInTimeZone } from "date-fns-tz";

const TZ = "America/Chicago";

type Props = {
  sessions: SessionListItem[];
};

function fmtRange(startUtc: string, endUtc: string) {
  const start = new Date(startUtc);
  const end = new Date(endUtc);
  const day = formatInTimeZone(start, TZ, "EEE MMM d");
  const startTime = formatInTimeZone(start, TZ, "h:mm a");
  const endTime = formatInTimeZone(end, TZ, "h:mm a");
  return `${day} • ${startTime}–${endTime}`;
}

export function UpcomingSessions({ sessions }: Props) {
  return (
    <div className="rounded-2xl border border-grey-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-grey-200 px-4 py-3">
        <div className="text-sm font-semibold text-grey-900">Upcoming Sessions</div>
        <a
          href="/admin/sessions"
          className="text-xs font-semibold text-grey-700 underline underline-offset-4 hover:text-grey-900"
        >
          View all
        </a>
      </div>

      {sessions.length === 0 ? (
        <div className="px-4 py-6 text-sm text-grey-600">No Upcoming Sessions.</div>
      ) : (
        <ul className="divide-y divide-grey-200 max-h-80 overflow-y-auto">
          {sessions.map((s) => (
            <li key={s.id} className="px-4 py-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold text-grey-900">
                    {s.clientName ?? `Client #${s.clientUserId}`}
                  </div>
                  <div className="mt-0.5 text-sm text-grey-600">
                    {s.serviceTitle ?? "Session"}
                  </div>
                  <div className="mt-1 text-xs text-grey-500">
                    {fmtRange(s.scheduledStartUtc, s.scheduledEndUtc)}
                    {s.location ? ` • ${s.location}` : ""}
                  </div>
                </div>

                <div className="shrink-0">
                  <a
                    href={`/admin/sessions`}
                    className="inline-flex! items-center! rounded-md! border! border-grey-200! bg-white! px-2 py-1 text-xs! font-semibold! text-grey-900! hover:bg-grey-100!"
                  >
                    Details
                  </a>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
