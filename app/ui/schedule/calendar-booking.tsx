"use client";

import { useCallback, useMemo, useRef, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { fromZonedTime, formatInTimeZone } from "date-fns-tz";
import luxonPlugin from "@fullcalendar/luxon3";
import { toast } from "react-toastify";
import { CoachSelect } from "../components/select/coaches";
import { ServiceSelect } from "../components/select/services";
import { DurationSelect } from "../components/select/duration";

const TZ = "America/Chicago";

type SlotOption = { durationMinutes: 30 | 60; end: string }; // UTC ISO
type SlotGroup = { start: string; options: SlotOption[] };   // start UTC ISO
type AvailabilityResponse = {
  ok: boolean;
  slots?: SlotGroup[];
  error?: string;
};
type ServiceOption = { id: string; slug: string; title: string };
type CoachOption = { id: number; name: string };

// Build a Chicago-local day window from a YYYY-MM-DD date string
function chicagoDayWindowUtcFromYmd(ymd: string) {
  const [y, m, d] = ymd.split("-").map(Number);
  const localStart = new Date(y, m - 1, d, 0, 0, 0);
  const localEnd = new Date(y, m - 1, d + 1, 0, 0, 0);

  return {
    startUtc: fromZonedTime(localStart, TZ),
    endUtc: fromZonedTime(localEnd, TZ),
  };
}

export default function CalendarBooking() {
  const calendarRef = useRef<any>(null);

  const [view, setView] = useState<"month" | "day">("month");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [slots, setSlots] = useState<SlotGroup[]>([]);
  const [activeYmd, setActiveYmd] = useState<string | null>(null); // YYYY-MM-DD (Chicago day)
  const [activeDayUtcRange, setActiveDayUtcRange] = useState<{ start: Date; end: Date } | null>(null);

  const [selectedStart, setSelectedStart] = useState<string | null>(null);
  const [selectedDuration, setSelectedDuration] = useState<30 | 60>(60);

  const [monthAvailability, setMonthAvailability] = useState<Set<string>>(new Set());
  const lastMonthRange = useRef<{ start: string; end: string } | null>(null);

  const [services, setServices] = useState<ServiceOption[]>([]);
  const [selectedService, setSelectedService] = useState<ServiceOption | null>(null);

  const selectedSlot = useMemo(
    () => slots.find((s) => s.start === selectedStart) ?? null,
    [slots, selectedStart]
  );

  const [coaches, setCoaches] = useState<CoachOption[]>([]);
  const [selectedCoachId, setSelectedCoachId] = useState<number | null>(null);

  const searchParams = useSearchParams();
  const router = useRouter();
  const preselectServiceId = searchParams.get("serviceId");

  useEffect(() => {
    if (!preselectServiceId) return;
    if (!services.length) return;              // wait until services loaded
    if (selectedService) return;               // don’t override if user already picked

    const found = services.find((s) => s.id === preselectServiceId);
    if (found) {
      setSelectedService(found);

      // Optional: clean the URL so refresh doesn’t keep forcing selection
      const next = new URLSearchParams(searchParams.toString());
      next.delete("serviceId");
      router.replace(`/client/schedule?${next.toString()}`);
    }
  }, [preselectServiceId, services, selectedService, searchParams, router]);

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/services"); // you create this if you don't have it yet
      const data = await res.json();
      setServices(data.services ?? []);
    })();
  }, []);

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/coaches");
      const data = await res.json();
      const list: CoachOption[] = data?.coaches ?? [];
      setCoaches(list);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchAvailabilityForYmd = useCallback(
    async (ymd: string) => {
      // idempotency guard: do not refetch the same day if already loaded (unless you want refresh)
      setError("");
      setLoading(true);

      try {
        const { startUtc, endUtc } = chicagoDayWindowUtcFromYmd(ymd);
        setActiveDayUtcRange({ start: startUtc, end: endUtc });

        const qs = new URLSearchParams({
          coachId: String(selectedCoachId),
          start: startUtc.toISOString(),
          end: endUtc.toISOString(),
        });

        const res = await fetch(`/api/availability?${qs.toString()}`);
        const data = (await res.json()) as AvailabilityResponse;

        if (!res.ok || !data.ok) {
          throw new Error(data?.error || "Failed to load availability");
        }

        setSlots(data.slots ?? []);
      } catch (e: any) {
        setSlots([]);
        setError(e?.message ?? "Failed to load availability");
      } finally {
        setLoading(false);
      }
    },
    [selectedCoachId]
  );

  const fetchMonthAvailability = useCallback(async (startYmd: string, endYmd: string) => {
    // startYmd inclusive, endYmd exclusive (FullCalendar style)
    const qs = new URLSearchParams({
      coachId: String(selectedCoachId),
      start: startYmd,
      end: endYmd,
    });

    console.log("Fetching month availability for", qs.toString());

    const res = await fetch(`/api/availability/month?${qs.toString()}`);
    const data = await res.json();

    if (res.ok && data?.ok) {
      setMonthAvailability(new Set(data.days as string[]));
    } else {
      setMonthAvailability(new Set());
    }
  }, [selectedCoachId]);

  async function bookSelected() {
    if (!selectedSlot) return;
    const option = selectedSlot.options.find((o) => o.durationMinutes === selectedDuration);
    if (!option) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/sessions/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          coachId: selectedCoachId,
          start: selectedSlot.start,
          end: option.end,
          location: null,
          notes: null,
          sanityServiceId: selectedService?.id ?? null,
          sanityServiceSlug: selectedService?.slug ?? null,
          sanityServiceTitle: selectedService?.title ?? null,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data?.ok) {
        if (data?.error === "slot_taken") throw new Error("That time was just taken. Pick another slot.");
        if (data?.error === "no_credits") throw new Error("You don’t have enough credits to book.");
        throw new Error(data?.detail ?? "Booking failed.");
      }

      // Refresh availability for the active day after booking
      setSelectedStart(null);
      if (activeYmd) {
        await fetchAvailabilityForYmd(activeYmd);
      }
      toast.success("Session booked successfully!");
    } catch (e: any) {
      setError(e?.message ?? "Booking failed");
      toast.error(e?.message ?? "Booking failed");
    } finally {
      setLoading(false);
    }
  }

  const groupedSlots = useMemo(() => {
    const morning: SlotGroup[] = [];
    const afternoon: SlotGroup[] = [];

    for (const s of slots) {
      const localHour = Number(formatInTimeZone(new Date(s.start), TZ, "H")); // 0-23
      if (localHour < 12) morning.push(s);
      else afternoon.push(s);
    }

    return { morning, afternoon };
  }, [slots]);

  return (
    <div className="rounded-xl border p-2">
      <div className="flex items-start justify-between gap-3 pb-3">
        <div>
          <h2 className="text-xl! font-semibold! text-black!">Book a Session</h2>
          <p className="text-sm! text-black/80!">
            Times shown in Central Time (Chicago).
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-[1fr_360px]">
        {/* LEFT: Calendar and Booking Controls */}
        <div className="flex flex-col gap-4">
          <div className="rounded-xl border p-2">
            <FullCalendar
              ref={calendarRef}
              plugins={[dayGridPlugin, interactionPlugin, luxonPlugin]}
              initialView="dayGridMonth"
              timeZone={TZ}
              height="auto"
              headerToolbar={{
                left: "prev,next",
                center: "title",
                right: "",
              }}
              dateClick={(arg) => {
                const todayYmd = formatInTimeZone(new Date(), TZ, "yyyy-MM-dd");
                const ymd = arg.dateStr;

                // Block past days
                if (ymd < todayYmd) return;

                // Block unavailable days
                if (!monthAvailability.has(ymd)) return;

                setSelectedStart(null);
                setSlots([]);
                setError("");
                setActiveYmd(ymd);
                fetchAvailabilityForYmd(ymd);
              }}
              validRange={{
                start: formatInTimeZone(new Date(), TZ, "yyyy-MM-dd"),
              }}
              datesSet={(arg) => {
                if (arg.view.type !== "dayGridMonth") return;

                const startAnchor = new Date(arg.start.getTime() + 12 * 60 * 60 * 1000);
                const endAnchor = new Date(arg.end.getTime() + 12 * 60 * 60 * 1000);

                const startYmd = formatInTimeZone(startAnchor, TZ, "yyyy-MM-dd");
                const endYmd = formatInTimeZone(endAnchor, TZ, "yyyy-MM-dd");

                // Only fetch if range changed
                if (
                  !lastMonthRange.current ||
                  lastMonthRange.current.start !== startYmd ||
                  lastMonthRange.current.end !== endYmd
                ) {
                  lastMonthRange.current = { start: startYmd, end: endYmd };
                  fetchMonthAvailability(startYmd, endYmd);
                }
              }}
              dayCellClassNames={(arg) => {
                const ymd = formatInTimeZone(arg.date, TZ, "yyyy-MM-dd");
                const todayYmd = formatInTimeZone(new Date(), TZ, "yyyy-MM-dd");

                const classes: string[] = [];

                // selected day
                if (ymd === activeYmd) classes.push("cs-day-selected");

                // past day
                if (ymd < todayYmd) classes.push("cs-day-past");

                // availability markers (only for today+future)
                if (ymd >= todayYmd) {
                  if (monthAvailability.has(ymd)) classes.push("cs-day-available");
                  else classes.push("cs-day-unavailable");
                }

                return classes;
              }}
            />
          </div>

          {/* Booking controls below the calendar */}
          <div className="border-t pt-3 space-y-2">
            <div className="text-sm text-black">
              <div className="font-medium">Selected time</div>
              <div className="text-black/80">
                {selectedStart
                  ? formatInTimeZone(new Date(selectedStart), TZ, "EEE MMM d, h:mm a")
                  : "Select a time to continue."}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                className="w-full rounded-md border border-green-800 bg-green-700 px-3 py-2 text-sm font-semibold text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors hover:bg-green-800 hover:border-green-900"
                disabled={
                  loading ||
                  !selectedSlot ||
                  !selectedCoachId ||
                  !selectedService
                }
                onClick={bookSelected}
              >
                Book
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT: Timeslots */}
        <div className="rounded-xl border p-3 space-y-3">
          <div className="space-y-1">
            <CoachSelect
              coaches={coaches}
              value={selectedCoachId}
              onChange={coachId => {
                setSelectedCoachId(coachId);
                // reset selection state
                setActiveYmd(null);
                setSelectedStart(null);
                setSlots([]);
                setError("");
                // clear month availability so calendar greys out until refetch
                setMonthAvailability(new Set());
                lastMonthRange.current = null;
                // If you want: immediately refetch month availability for the visible month
                const api = calendarRef.current?.getApi();
                if (api && coachId) {
                  api.render();
                }
              }}
              loading={loading}
            />
          </div>

          <div className="space-y-1">
            <ServiceSelect
              services={services}
              value={selectedService}
              onChange={setSelectedService}
              loading={loading}
            />
          </div>

          <div className="space-y-1">
            <DurationSelect
              options={selectedSlot?.options ?? [{ durationMinutes: 60 }, { durationMinutes: 30 }]}
              value={selectedDuration}
              onChange={(duration) => {
                if (duration === 30 || duration === 60) {
                  setSelectedDuration(duration);
                }
                // Optionally handle null here if needed
              }}
              disabled={!selectedSlot}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold text-black">
              {activeYmd
                ? `Available times for ${formatInTimeZone(new Date(`${activeYmd}T12:00:00`), TZ, "EEE MMM d, yyyy")}`
                : "Please select a date."}
            </div>
          </div>

          {loading ? (
            <div className="text-sm text-black/70">Loading…</div>
          ) : !activeYmd ? (
            <div className="text-sm text-black/70">Pick a day on the calendar.</div>
          ) : slots.length === 0 ? (
            <div className="text-sm text-black/70">No times available.</div>
          ) : (
            <div className="space-y-4">
              {/* Morning */}
              <div>
                <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-black/70">
                  Morning
                </div>
                {groupedSlots.morning.length === 0 ? (
                  <div className="text-sm text-black/60">No morning times.</div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    {groupedSlots.morning.map((s) => {
                      const label = formatInTimeZone(new Date(s.start), TZ, "h:mm a");
                      const isSelected = s.start === selectedStart;

                      return (
                        <button
                          key={s.start}
                          type="button"
                          onClick={() => {
                            setSelectedStart(s.start);
                            // Only change duration if the current selectedDuration is not available for this slot
                            if (!s.options.some((o) => o.durationMinutes === selectedDuration)) {
                              const has60 = s.options.some((o) => o.durationMinutes === 60);
                              setSelectedDuration(has60 ? 60 : 30);
                            }
                          }}
                          className={[
                            "rounded-md border px-2 py-2 text-sm font-semibold text-black",
                            isSelected ? "bg-lime-200 border-lime-500" : "bg-white border-black/20",
                            "hover:bg-slate-100",
                          ].join(" ")}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Afternoon */}
              <div>
                <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-black/70">
                  Afternoon
                </div>
                {groupedSlots.afternoon.length === 0 ? (
                  <div className="text-sm text-black/60">No afternoon times.</div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    {groupedSlots.afternoon.map((s) => {
                      const label = formatInTimeZone(new Date(s.start), TZ, "h:mm a");
                      const isSelected = s.start === selectedStart;

                      return (
                        <button
                          key={s.start}
                          type="button"
                          onClick={() => {
                            setSelectedStart(s.start);
                            // Only change duration if the current selectedDuration is not available for this slot
                            if (!s.options.some((o) => o.durationMinutes === selectedDuration)) {
                              const has60 = s.options.some((o) => o.durationMinutes === 60);
                              setSelectedDuration(has60 ? 60 : 30);
                            }
                          }}
                          className={[
                            "rounded-md border px-2 py-2 text-sm font-semibold text-black",
                            isSelected ? "bg-lime-200 border-lime-500" : "bg-white border-black/20",
                            "hover:bg-slate-100",
                          ].join(" ")}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
