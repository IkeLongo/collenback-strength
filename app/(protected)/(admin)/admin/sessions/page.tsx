// app/(admin)/admin/sessions/page.tsx
"use client";

import { useState } from "react";
import AdminSessionsCalendar from "@/app/ui/admin/admin-sessions-calendar";
import NeedsActionTable from "@/app/ui/admin/needs-action-table"; // your existing list version

export default function AdminSessionsPage() {
  const [tab, setTab] = useState<"calendar" | "needs_action">("calendar");

  return (
    <div className="space-y-4">
      <div className="flex w-fit rounded-2xl border border-grey-300 bg-white p-1 shadow-sm gap-2">
        {[
          { key: "calendar", label: "Calendar" },
          { key: "needs_action", label: "Needs action" },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key as any)}
            className={[
              "rounded-2xl px-4 py-2 text-sm font-medium",
              tab === t.key ? "bg-grey-700 text-white" : "text-grey-700 hover:bg-grey-100",
            ].join(" ")}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "calendar" ? <AdminSessionsCalendar /> : <NeedsActionTable />}
    </div>
  );
}
