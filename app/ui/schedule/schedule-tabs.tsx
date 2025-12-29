"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Calendar, ListChecks } from "lucide-react";
import CalendarBooking from "@/app/ui/schedule/calendar-booking";
import MySchedule from "@/app/ui/schedule/my-schedule";
import { MultiSelect } from "@/app/ui/components/input/multi-select";
import { Label } from "@/app/ui/components/form/label";
import { LabelInputContainer } from "@/app/ui/components/input/label-input-container";

type TabKey = "book_session" | "my_schedule";

const TAB_OPTIONS: { value: TabKey; label: string }[] = [
  { value: "my_schedule", label: "My Schedule" },
  { value: "book_session", label: "Book Session" },
];

export default function ScheduleTabs() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const serviceId = searchParams.get("serviceId");

  // default state
  const [tab, setTab] = useState<TabKey>("my_schedule");

  // ✅ if serviceId is present, jump to Book Session
  useEffect(() => {
    if (serviceId) setTab("book_session");
  }, [serviceId]);

  // Optional: when user manually changes tabs, clean up URL so refresh doesn't force book_session
  const setTabAndMaybeCleanUrl = (next: TabKey) => {
    setTab(next);

    if (next === "my_schedule" && serviceId) {
      router.replace(pathname); // removes ?serviceId=...
    }
  };

  return (
    <div className="space-y-4">
      {/* Mobile/tablet: dropdown */}
      <div className="md:hidden">
        <div className="bg-white rounded-2xl border border-grey-200 shadow-sm p-3">
          <LabelInputContainer className="mb-0">
            <Label className="text-grey-700!" htmlFor="schedule-tab-select">
              View:
            </Label>

            <MultiSelect
              options={TAB_OPTIONS}
              value={tab}
              onChange={(val) => {
                const next = (val || "my_schedule") as TabKey;
                setTabAndMaybeCleanUrl(next);
              }}
              placeholder="Select..."
              singleSelect
              className="w-full bg-white text-black font-outfit max-w-full rounded-md border border-grey-300 shadow"
            />
          </LabelInputContainer>
        </div>
      </div>

      {/* Desktop: tabs */}
      <div className="hidden md:block">
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
                onClick={() => setTabAndMaybeCleanUrl(key)}
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
      </div>

      {/* Content */}
      {tab === "book_session" ? <CalendarBooking /> : <MySchedule />}
    </div>
  );
}
