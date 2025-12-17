"use client";


import { useState } from "react";
import { Calendar, ListChecks } from "lucide-react";
import CalendarBooking from "@/app/ui/schedule/calendar-booking";
import MySchedule from "@/app/ui/schedule/my-schedule";

type TabKey = "book_session" | "my_schedule";

export default function ScheduleTabs() {
  const [tab, setTab] = useState<TabKey>("my_schedule");

  return (
    <div className="space-y-4">
      {/* Tabs header */}
      <div className="flex bg-white rounded-2xl border border-grey-200 shadow-sm py-2 px-4 pb-3 w-fit">
        {([
          { key: "my_schedule", label: "My Schedule", icon: ListChecks },
          { key: "book_session", label: "Book Session", icon: Calendar },
        ] as const).map(({ key, label, icon: Icon }) => {
          const active = tab === key;
          return (
            <div
              key={key}
              className={[
                "flex items-center px-3 py-1.5 border-b-[2px] border-b-grey-100 text-sm transition cursor-pointer",
                active
                  ? "border-b-[3px] border-b-grey-500"
                  : "bg-grey-50 text-grey-700 hover:text-grey-900",
              ].join(" ")}
              onClick={() => setTab(key as TabKey)}
            >
              <span
                className={[
                  "flex items-center gap-2 rounded-full px-3 py-1.5 text-sm transition",
                  active
                    ? "text-grey-700 font-semibold!"
                    : "bg-grey-50 text-grey-700 hover:text-grey-900",
                ].join(" ")}
              >
                <Icon className="w-4 h-4" />
                {label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Tab content */}
      {tab === "book_session" ? <CalendarBooking /> : <MySchedule />}
    </div>
  );
}
