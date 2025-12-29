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
type SlotGroup = { start: string; options: SlotOption[] }; // start UTC ISO
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

  const calendarSectionRef = useRef<HTMLDivElement>(null);
  const timesSectionRef = useRef<HTMLDivElement>(null);
  const confirmSectionRef = useRef<HTMLDivElement>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [slots, setSlots] = useState<SlotGroup[]>([]);
  const [activeYmd, setActiveYmd] = useState<string | null>(null); // YYYY-MM-DD (Chicago day)

  const [selectedStart, setSelectedStart] = useState<string | null>(null);
  const [selectedDuration, setSelectedDuration] = useState<30 | 60>(60);

  const [monthAvailability, setMonthAvailability] = useState<Set<string>>(new Set());
  const lastMonthRange = useRef<{ start: string; end: string } | null>(null);

  const [services, setServices] = useState<ServiceOption[]>([]);
  const [selectedService, setSelectedService] = useState<ServiceOption | null>(null);

  const [coaches, setCoaches] = useState<CoachOption[]>([]);
  const [selectedCoachId, setSelectedCoachId] = useState<number | null>(null);

  const selectedSlot = useMemo(
    () => slots.find((s) => s.start === selectedStart) ?? null,
    [slots, selectedStart]
  );

  const searchParams = useSearchParams();
  const router = useRouter();
  const preselectServiceId = searchParams.get("serviceId");

  // ✅ Load services
  useEffect(() => {
    (async () => {
      const res = await fetch("/api/services");
      const data = await res.json();
      setServices(data.services ?? []);
    })();
  }, []);

  // ✅ Load coaches
  useEffect(() => {
    (async () => {
      const res = await fetch("/api/coaches");
      const data = await res.json();
      setCoaches(data?.coaches ?? []);
    })();
  }, []);

  // ✅ Preselect service from URL, then clean it from querystring
  useEffect(() => {
    if (!preselectServiceId) return;
    if (!services.length) return; // wait until services loaded
    if (selectedService) return; // don’t override if user already picked

    const found = services.find((s) => s.id === preselectServiceId);
    if (found) {
      setSelectedService(found);

      // clean URL so refresh doesn't keep forcing selection
      const next = new URLSearchParams(searchParams.toString());
      next.delete("serviceId");
      router.replace(`/client/schedule?${next.toString()}`);
    }
  }, [preselectServiceId, services, selectedService, searchParams, router]);

  const fetchAvailabilityForYmd = useCallback(
    async (ymd: string) => {
      // ✅ Hard gate: must pick coach AND service first
      if (!selectedCoachId || !selectedService) {
        setSlots([]);
        setError("Please select a coach and service first.");
        return;
      }

      setError("");
      setLoading(true);

      try {
        const { startUtc, endUtc } = chicagoDayWindowUtcFromYmd(ymd);

        const qs = new URLSearchParams({
          coachId: String(selectedCoachId),
          start: startUtc.toISOString(),
          end: endUtc.toISOString(),
        });

        const res = await fetch(`/api/availability?${qs.toString()}`, { cache: "no-store" });
        const data = (await res.json()) as AvailabilityResponse;

        if (!res.ok || !data.ok) throw new Error(data?.error || "Failed to load availability");
        setSlots(data.slots ?? []);
      } catch (e: any) {
        setSlots([]);
        setError(e?.message ?? "Failed to load availability");
      } finally {
        setLoading(false);
      }
    },
    [selectedCoachId, selectedService]
  );

  const fetchMonthAvailability = useCallback(
    async (startYmd: string, endYmd: string) => {
      // ✅ Hard gate: must pick coach AND service first
      if (!selectedCoachId || !selectedService) {
        setMonthAvailability(new Set());
        return;
      }

      const qs = new URLSearchParams({
        coachId: String(selectedCoachId),
        start: startYmd,
        end: endYmd,
      });

      const res = await fetch(`/api/availability/month?${qs.toString()}`, { cache: "no-store" });
      const data = await res.json();

      if (res.ok && data?.ok) setMonthAvailability(new Set(data.days as string[]));
      else setMonthAvailability(new Set());
    },
    [selectedCoachId, selectedService]
  );

  async function bookSelected() {
    if (!selectedSlot) return;
    const option = selectedSlot.options.find((o) => o.durationMinutes === selectedDuration);
    if (!option) return;

    // ✅ Hard gate
    if (!selectedCoachId || !selectedService) {
      toast.error("Please select a coach and service first.");
      return;
    }

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

      setSelectedStart(null);
      if (activeYmd) await fetchAvailabilityForYmd(activeYmd);

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
      const localHour = Number(formatInTimeZone(new Date(s.start), TZ, "H"));
      if (localHour < 12) morning.push(s);
      else afternoon.push(s);
    }
    return { morning, afternoon };
  }, [slots]);

  // ✅ Flow gates (must have BOTH coach + service)
  const canPickDate = Boolean(selectedCoachId && selectedService);
  const canPickTime = Boolean(activeYmd);
  const canBook = Boolean(selectedCoachId && selectedService && selectedSlot && !loading);

  const summaryCoachName =
    selectedCoachId ? coaches.find((c) => c.id === selectedCoachId)?.name ?? "Selected" : "—";

  return (
    <div className="rounded-xl border bg-white p-3 sm:p-4">
      <div className="flex flex-col gap-4">
        {/* STEP 1 */}
        <div className="rounded-2xl border p-4 space-y-3 bg-white shadow-sm">
          <div>
            <div className="text-[11px] font-semibold text-grey-500 uppercase tracking-wide">
              Step 1
            </div>
            <h3 className="text-lg! font-medium! text-black!">Choose your session</h3>
            <p className="text-sm! text-black/70!">
              Select a coach and service to unlock the calendar.
            </p>
          </div>

          <div className="space-y-1">
            <CoachSelect
              coaches={coaches}
              value={selectedCoachId}
              onChange={(coachId) => {
                setSelectedCoachId(coachId);

                // reset day/slot selections
                setActiveYmd(null);
                setSelectedStart(null);
                setSlots([]);
                setError("");
                setMonthAvailability(new Set());
                lastMonthRange.current = null;

                // Only scroll if service already selected; otherwise user still needs service.
                if (coachId && selectedService) {
                  setTimeout(() => {
                    calendarSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
                  }, 50);
                }
              }}
              loading={loading}
            />
          </div>

          <div className="space-y-1">
            <ServiceSelect
              services={services}
              value={selectedService}
              onChange={(service) => {
                setSelectedService(service);

                // reset day/slot selections
                setActiveYmd(null);
                setSelectedStart(null);
                setSlots([]);
                setError("");
                setMonthAvailability(new Set());
                lastMonthRange.current = null;

                // Only scroll if coach already selected; otherwise user still needs coach.
                if (service && selectedCoachId) {
                  setTimeout(() => {
                    calendarSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
                  }, 50);
                }
              }}
              loading={loading}
            />
          </div>

          <div className="space-y-1">
            <DurationSelect
              options={selectedSlot?.options ?? [{ durationMinutes: 60 }, { durationMinutes: 30 }]}
              value={selectedDuration}
              onChange={(duration) => {
                if (duration === 30 || duration === 60) setSelectedDuration(duration);
              }}
              disabled={!selectedSlot}
            />
          </div>

          {error ? (
            <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          ) : null}
        </div>

        {/* STEP 2 */}
        <div ref={calendarSectionRef} className="max-w-2xl">
          <div
            className={[
              "rounded-xl border p-3 relative bg-white",
              !canPickDate ? "opacity-50 pointer-events-none" : "",
            ].join(" ")}
          >
            {!canPickDate && (
              <div className="absolute inset-0 flex items-center justify-center z-10">
                <div className="bg-white/90 border rounded-lg px-4 py-2 text-sm font-semibold text-black shadow">
                  Select a coach and service to view availability
                </div>
              </div>
            )}

            <div className="pb-2">
              <div className="text-[11px] font-semibold text-grey-500 uppercase tracking-wide">
                Step 2
              </div>
              <h3 className="text-lg! font-medium! text-black!">Pick a date</h3>
              <p className="text-sm! text-black/70!">Available days are highlighted.</p>
            </div>

            <FullCalendar
              ref={calendarRef}
              plugins={[dayGridPlugin, interactionPlugin, luxonPlugin]}
              initialView="dayGridMonth"
              timeZone={TZ}
              height="auto"
              headerToolbar={{ left: "prev,next", center: "title", right: "" }}
              dateClick={(arg) => {
                const todayYmd = formatInTimeZone(new Date(), TZ, "yyyy-MM-dd");
                const ymd = arg.dateStr;

                if (ymd < todayYmd) return;
                if (!monthAvailability.has(ymd)) return;

                setSelectedStart(null);
                setSlots([]);
                setError("");
                setActiveYmd(ymd);
                fetchAvailabilityForYmd(ymd);

                setTimeout(() => {
                  timesSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
                }, 50);
              }}
              validRange={{ start: formatInTimeZone(new Date(), TZ, "yyyy-MM-dd") }}
              datesSet={(arg) => {
                if (arg.view.type !== "dayGridMonth") return;

                const startAnchor = new Date(arg.start.getTime() + 12 * 60 * 60 * 1000);
                const endAnchor = new Date(arg.end.getTime() + 12 * 60 * 60 * 1000);

                const startYmd = formatInTimeZone(startAnchor, TZ, "yyyy-MM-dd");
                const endYmd = formatInTimeZone(endAnchor, TZ, "yyyy-MM-dd");

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
                if (ymd === activeYmd) classes.push("cs-day-selected");
                if (ymd < todayYmd) classes.push("cs-day-past");
                if (ymd >= todayYmd) {
                  if (monthAvailability.has(ymd)) classes.push("cs-day-available");
                  else classes.push("cs-day-unavailable");
                }
                return classes;
              }}
            />
          </div>
        </div>

        {/* STEP 3 */}
        <div ref={timesSectionRef} className="max-w-2xl">
          <div
            className={[
              "rounded-xl border p-4 space-y-4 relative bg-white",
              !canPickTime ? "opacity-50 pointer-events-none" : "",
            ].join(" ")}
          >
            {!canPickTime && (
              <div className="absolute inset-0 flex items-center justify-center z-10">
                <div className="bg-white/90 border rounded-lg px-4 py-2 text-sm font-semibold text-black shadow">
                  Pick a day on the calendar first
                </div>
              </div>
            )}

            <div>
              <div className="text-[11px] font-semibold text-grey-500 uppercase tracking-wide">
                Step 3
              </div>
              <h3 className="text-lg! font-medium! text-black!">Pick a time</h3>
              <p className="text-sm! text-black/70!">Choose a time slot (morning/afternoon).</p>
            </div>

            {loading ? (
              <div className="text-sm text-black/70">Loading…</div>
            ) : !activeYmd ? (
              <div className="text-sm text-black/70">Pick a day on the calendar.</div>
            ) : slots.length === 0 ? (
              <div className="text-sm text-black/70">No times available.</div>
            ) : (
              <>
                <div className="rounded-lg border bg-grey-50 p-3 text-sm text-black">
                  Available times for{" "}
                  <span className="font-semibold">
                    {formatInTimeZone(new Date(`${activeYmd}T12:00:00`), TZ, "EEE MMM d, yyyy")}
                  </span>
                </div>

                {/* Morning */}
                <div>
                  <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-black/70">
                    Morning
                  </div>
                  {groupedSlots.morning.length === 0 ? (
                    <div className="text-sm text-black/60">No morning times.</div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {groupedSlots.morning.map((s) => {
                        const label = formatInTimeZone(new Date(s.start), TZ, "h:mm a");
                        const isSelected = s.start === selectedStart;
                        return (
                          <button
                            key={s.start}
                            type="button"
                            onClick={() => {
                              setSelectedStart(s.start);

                              if (!s.options.some((o) => o.durationMinutes === selectedDuration)) {
                                const has60 = s.options.some((o) => o.durationMinutes === 60);
                                setSelectedDuration(has60 ? 60 : 30);
                              }

                              setTimeout(() => {
                                confirmSectionRef.current?.scrollIntoView({
                                  behavior: "smooth",
                                  block: "start",
                                });
                              }, 50);
                            }}
                            className={[
                              "rounded-md border px-2 py-2 text-sm font-semibold text-black transition",
                              isSelected
                                ? "bg-lime-200 border-lime-500"
                                : "bg-white border-black/20 hover:bg-slate-100",
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
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {groupedSlots.afternoon.map((s) => {
                        const label = formatInTimeZone(new Date(s.start), TZ, "h:mm a");
                        const isSelected = s.start === selectedStart;
                        return (
                          <button
                            key={s.start}
                            type="button"
                            onClick={() => {
                              setSelectedStart(s.start);

                              if (!s.options.some((o) => o.durationMinutes === selectedDuration)) {
                                const has60 = s.options.some((o) => o.durationMinutes === 60);
                                setSelectedDuration(has60 ? 60 : 30);
                              }

                              setTimeout(() => {
                                confirmSectionRef.current?.scrollIntoView({
                                  behavior: "smooth",
                                  block: "start",
                                });
                              }, 50);
                            }}
                            className={[
                              "rounded-md border px-2 py-2 text-sm font-semibold text-black transition",
                              isSelected
                                ? "bg-lime-200 border-lime-500"
                                : "bg-white border-black/20 hover:bg-slate-100",
                            ].join(" ")}
                          >
                            {label}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* STEP 4 */}
        <div ref={confirmSectionRef} className="max-w-2xl">
          <div className="border-t pt-4 space-y-3">
            <div>
              <div className="text-[11px] font-semibold text-grey-500 uppercase tracking-wide">
                Step 4
              </div>
              <h3 className="text-lg! font-medium! text-black!">Confirm & book</h3>
              <p className="text-sm! text-black/70!">Review details, then book.</p>
            </div>

            <div className="rounded-lg border bg-white p-3 text-sm text-black">
              <div className="font-semibold mb-1">Summary</div>
              <div className="text-black/80 leading-relaxed">
                Coach: <span className="font-medium">{summaryCoachName}</span>
                <br />
                Service: <span className="font-medium">{selectedService?.title ?? "—"}</span>
                <br />
                Time:{" "}
                <span className="font-medium">
                  {selectedStart
                    ? formatInTimeZone(new Date(selectedStart), TZ, "EEE MMM d, h:mm a")
                    : "—"}
                </span>
                <br />
                Duration: <span className="font-medium">{selectedDuration} min</span>
              </div>
            </div>

            <button
              className="w-full rounded-md border border-green-800 bg-green-700 px-3 py-2 text-sm font-semibold text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors hover:bg-green-800 hover:border-green-900"
              disabled={!canBook}
              onClick={bookSelected}
            >
              {loading ? "Booking..." : "Book"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
