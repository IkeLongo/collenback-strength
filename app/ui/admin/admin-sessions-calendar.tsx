"use client";

import { useCallback, useMemo, useRef, useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import luxonPlugin from "@fullcalendar/luxon3";
import { formatInTimeZone } from "date-fns-tz";
import AdminSessionModal from "@/app/ui/components/modal/AdminSessionModal";
import { ActionMultiSelect, type SessionAction } from "@/app/ui/components/select/action";
import { client } from "@/sanity/lib/client";

const TZ = "America/Chicago";

type SessionRow = {
  id: number;

  scheduled_start: string; // "YYYY-MM-DD HH:MM:SS"
  scheduled_end: string;

  status: "scheduled" | "completed" | "cancelled" | "no_show";

  sanity_service_slug: string | null;
  service_title: string | null;
  service_category_title: string | null;
  service_category: string | null;

  client_first_name: string | null;
  client_last_name: string | null;
  client_email: string;

  coach_id: number | null;
  coach_first_name: string | null;
  coach_last_name: string | null;
  coach_email: string | null;

  confirmed_at: string | null;
  cancellation_reason: string | null;
  location: string | null;
  notes: string | null;
};

type ListResponse = {
  ok: boolean;
  sessions: SessionRow[];
};

function name(first?: string | null, last?: string | null) {
  return [first, last].filter(Boolean).join(" ").trim() || "—";
}

function toYmd(dt: Date) {
  return formatInTimeZone(dt, TZ, "yyyy-MM-dd");
}

// FullCalendar accepts ISO-ish strings too.
// If your DB datetimes are stored in Chicago local time, this works well.
// If later you confirm your DB is UTC, we can adjust by appending "Z" + converting.
function sqlDatetimeToIsoUtc(dt: string) {
  // Tell JS explicitly: this datetime is UTC
  return dt.replace(" ", "T") + "Z";
}

function coachColor(seed: string | number) {
  const colors = [
    { bg: "#EEF2FF", border: "#4338CA" }, // indigo
    { bg: "#ECFEFF", border: "#0891B2" }, // cyan
    { bg: "#F0FDF4", border: "#15803D" }, // green
    { bg: "#FFF7ED", border: "#C2410C" }, // orange
    { bg: "#FDF2F8", border: "#BE185D" }, // pink
    { bg: "#F5F3FF", border: "#6D28D9" }, // violet
  ];

  const hash =
    typeof seed === "number"
      ? seed
      : seed.split("").reduce((a, c) => a + c.charCodeAt(0), 0);

  return colors[hash % colors.length];
}

async function finalizeFromModal(sessionId: number, action: SessionAction, extra?: any) {
  const res = await fetch(`/api/admin/sessions/${sessionId}/confirm`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      outcome: action,
      ...(extra ?? {}),
    }),
  });

  const body = await res.json();
  if (!res.ok) throw new Error(body?.message || "Failed to finalize session.");
  return body; // optional: use response for toast/UI
}

export default function AdminSessionsCalendar() {
  const calendarRef = useRef<FullCalendar | null>(null);
  const sessionsRef = useRef<SessionRow[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const [sessions, setSessions] = useState<SessionRow[]>([]);
  const [selected, setSelected] = useState<SessionRow | null>(null);
  const [viewType, setViewType] = useState<string>("timeGridWeek");
  const [range, setRange] = useState<{ start: Date; end: Date } | null>(null);

  const [modalBusy, setModalBusy] = useState(false);
  const [modalBusyText, setModalBusyText] = useState("Updating…");

  useEffect(() => { sessionsRef.current = sessions; }, [sessions]);

  function closeModal() {
    setSelected(null);
  }

  const fetchRange = useCallback(async (start: Date, end: Date) => {
    setLoading(true);
    setError("");

    try {
      // Your API supports from/to as YYYY-MM-DD (we built this earlier)
      const from = toYmd(start);
      // FullCalendar's `end` is exclusive for ranges; subtracting a day is optional.
      // We'll just use endYmd inclusive by setting to end - 1 day.
      const endMinus = new Date(end.getTime() - 24 * 60 * 60 * 1000);
      const to = toYmd(endMinus);

      const qs = new URLSearchParams({
        bucket: "all", // important: don't constrain by NOW(); range does the filtering
        from,
        to,
        limit: "200",
        offset: "0",
      });

      const res = await fetch(`/api/admin/sessions?${qs.toString()}`, {
        cache: "no-store",
      });
      const data = (await res.json()) as ListResponse;

      if (!res.ok || !(data as any)?.ok) {
        throw new Error((data as any)?.message || "Failed to load sessions");
      }

      // If you only want "scheduled" on the calendar:
      const filtered = (data.sessions ?? []).filter(
        (s) => s.status === "scheduled" || s.status === "completed"
      );
      setSessions(filtered);
    } catch (e: any) {
      setSessions([]);
      setError(e?.message ?? "Failed to load sessions");
    } finally {
      setLoading(false);
    }
  }, []);

  const events = useMemo(() => {
    return sessions.map((s) => {
      const title = s.service_category ?? "Session";
      const client = name(s.client_first_name, s.client_last_name);
      const coach = name(s.coach_first_name, s.coach_last_name);
      const service = s.service_title ?? s.sanity_service_slug ?? "session";
      const category = s.service_category_title ?? null;
      const coachKey = s.coach_id ?? s.coach_email ?? "unknown";
      const color = coachColor(coachKey);

      return {
        id: String(s.id),
        title: title,
        start: sqlDatetimeToIsoUtc(s.scheduled_start),
        end: sqlDatetimeToIsoUtc(s.scheduled_end),
        backgroundColor: color.bg,
        borderColor: "transparent", // prevent FC full border
        textColor: "#111827",
        classNames: [
          "cs-session-event",
          s.status === "scheduled" ? "cs-status-scheduled" : "",
          s.status === "completed" ? "cs-status-completed" : "",
          s.status === "cancelled" ? "cs-status-cancelled" : "",
          s.status === "no_show" ? "cs-status-noshow" : "",
        ].filter(Boolean),
        extendedProps: {
          session: s,
          coach,
          client,
          service,
          category,
        },
      };
    });
  }, [sessions]);

  async function fetchUpdate(start: Date, end: Date) {
    setRange({ start, end });

    const qs = new URLSearchParams({
      bucket: "all",
      from: start.toISOString().slice(0, 10), // or your API format
      to: end.toISOString().slice(0, 10),
      limit: "500",
      offset: "0",
    });

    const res = await fetch(`/api/admin/sessions?${qs.toString()}`, { cache: "no-store" });
    const data = await res.json();
    if (!res.ok || !data.ok) throw new Error(data?.message || "Failed to load sessions.");
    setSessions(data.sessions ?? []);
  }

  function patchSession(id: number, patch: Partial<SessionRow>) {
    setSessions((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  }

  async function handleFinalize(id: number, outcome: SessionAction, extra?: any) {
    // 1) optimistic UI update (instant)
    const optimisticStatus =
      outcome === "complete" ? "completed" :
      outcome === "cancel_release" ? "cancelled" :
      outcome === "no_show_charge" || outcome === "no_show_release" ? "no_show" :
      undefined;

    const prev = sessionsRef.current?.find((s) => s.id === id); // optional: for perfect revert

    if (optimisticStatus) {
      patchSession(id, {
        status: optimisticStatus as any,
        confirmed_at: new Date().toISOString(),
        ...(outcome === "cancel_release"
          ? { cancellation_reason: extra?.cancellationReason ?? null }
          : {}),
      });
    }

    try {
      // 2) call API
      await finalizeFromModal(id, outcome, extra);

      // 3) re-fetch visible range to guarantee DB truth
      if (range) await fetchRange(range.start, range.end);
    } catch (e) {
      // 4) revert if API fails
      if (prev) patchSession(id, prev);
      throw e;
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl! normal-case! font-semibold! text-grey-700!">Client Schedule</h1>
          <p className="text-sm! text-grey-500!">
            Calendar view for scheduled sessions (Central Time).
          </p>
        </div>
        <div className="text-sm text-grey-500">{loading ? "Loading…" : ""}</div>
      </div>

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-white p-4 text-sm text-red-600">
          {error}
        </div>
      ) : null}

      <div className="grid gap-4">
        {/* Calendar */}
        <div className="rounded-2xl border border-grey-300 bg-white p-3 shadow-sm">
          {/* Custom Calendar Header for mobile and desktop */}
          <div className="mb-2">
            <div className="flex flex-wrap gap-2 items-center justify-between">
              <div className="flex gap-2">
                <button type="button" className="fc-prev-button text-black px-2 py-1 border rounded cursor-pointer" onClick={() => calendarRef.current?.getApi().prev()}>Prev</button>
                <button type="button" className="fc-next-button text-black px-2 py-1 border rounded cursor-pointer" onClick={() => calendarRef.current?.getApi().next()}>Next</button>
                <button type="button" className="fc-today-button text-black px-2 py-1 border rounded cursor-pointer" onClick={() => calendarRef.current?.getApi().today()}>Today</button>
              </div>
              <div className="flex gap-2">
                <button type="button" className={viewType === "timeGridDay" ? "font-bold underline text-black" : "text-black"} onClick={() => calendarRef.current?.getApi().changeView("timeGridDay")}>Day</button>
                <button type="button" className={viewType === "timeGridWeek" ? "font-bold underline text-black" : "text-black"} onClick={() => calendarRef.current?.getApi().changeView("timeGridWeek")}>Week</button>
                <button type="button" className={viewType === "dayGridMonth" ? "font-bold underline text-black" : "text-black"} onClick={() => calendarRef.current?.getApi().changeView("dayGridMonth")}>Month</button>
              </div>
            </div>
            <div className="mt-2 text-center text-lg font-semibold text-grey-900">
              {calendarRef.current?.getApi().view?.title || "Calendar"}
            </div>
          </div>
          <FullCalendar
            ref={(r) => {
              // @ts-ignore
              calendarRef.current = r;
            }}
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, luxonPlugin]}
            timeZone={TZ}
            initialView="timeGridWeek"
            height="auto"

            // ✅ 4 rows per hour
            slotDuration="00:15:00"
            slotMinTime="05:00:00"
            slotMaxTime="22:00:00"

            // Optional but recommended:
            // Show hour labels every hour (not every 15 min)
            slotLabelInterval="01:00"

            // Make sure the labels show nicely
            slotLabelFormat={{
              hour: "numeric",
              minute: "2-digit",
              // meridiem: "short",
              omitZeroMinute: true,
            }}
            headerToolbar={false}
            dayHeaderContent={(args) => {
              const date = args.date;
              const weekday = date.toLocaleDateString("en-US", { weekday: "short" });
              // Month and day views: only weekday
              if (viewType === "dayGridMonth" || viewType === "timeGridDay") {
                return (
                  <div className="fc-custom-header flex flex-col items-center text-xs sm:text-sm md:text-base">
                    <span className="text-grey-500">{weekday}</span>
                  </div>
                );
              }
              // Week view: day number and weekday
              const dayNum = date.getDate();
              return (
                <div className="fc-custom-header flex flex-col items-center text-xs sm:text-sm md:text-base">
                  <span>{dayNum}</span>
                  <span className="text-xs text-grey-500">{weekday}</span>
                </div>
              );
            }}
            events={events}
            datesSet={(arg) => {
              setViewType(arg.view.type);
              fetchRange(arg.start, arg.end);
              fetchUpdate(arg.start, arg.end);
            }}
            eventClick={(info) => {
              const s = (info.event.extendedProps as any)?.session as SessionRow | undefined;
              if (s) setSelected(s);
            }}
            eventContent={(arg) => {
              const ext: any = arg.event.extendedProps;
              const coach = ext?.coach ?? "";
              const client = ext?.client ?? "";
              const category = ext?.category ?? null;

              const start = arg.event.start;
              const timeLabel =
                start
                  ? new Intl.DateTimeFormat("en-US", {
                      timeZone: "America/Chicago",
                      hour: "numeric",
                      minute: "2-digit",
                      hour12: true,
                    }).format(start)
                  : "";

              // ✅ MONTH VIEW: compact line-item
              if (viewType === "dayGridMonth") {
                return (
                  <div className="cs-month-item">
                    <span className="cs-month-time">{timeLabel}</span>
                    <span className="cs-month-client">{client || "Session"}</span>
                  </div>
                );
              }

              // ✅ WEEK/DAY VIEW: your rich block
              return (
                <div className="cs-event-inner flex flex-col justify-between h-full relative">
                  <div className="flex flex-col">
                    <div className="cs-event-coach">Coach: {coach}</div>
                    {client ? <div className="cs-event-client font-semibold text-xs">{client}</div> : null}
                    <div className="cs-event-service">{category ?? "Session"}</div>
                  </div>

                  {timeLabel ? <div className="cs-event-time text-[10px]">{timeLabel}</div> : null}
                </div>
              );
            }}
            eventDidMount={(info) => {
              const s = (info.event.extendedProps as any)?.session;
              if (!s) return;

              const coachKey = s.coach_id ?? s.coach_email ?? "unknown";
              const color = coachColor(coachKey);

              // Set variable on the event root element
              info.el.style.setProperty("--cs-left", color.border);

              // Optional: also set background through CSS var if you want
              info.el.style.setProperty("--cs-bg", color.bg);
            }}
            dayMaxEvents={4}           // shows "+ more" after 4 events
            eventDisplay={viewType === "dayGridMonth" ? "list-item" : "block"}
            displayEventTime={viewType === "dayGridMonth"}  // show time in month list style
            eventTimeFormat={{ hour: "numeric", minute: "2-digit", hour12: true }}
          />
        </div>
      </div>
      <AdminSessionModal
        open={!!selected}
        session={selected}
        loading={modalBusy}
        loadingText={modalBusyText}
        onClose={() => { if (!modalBusy) setSelected(null); }}
        onConfirm={async () => {
          if (!selected) return;
          setModalBusy(true);
          setModalBusyText("Confirming…");
          try {
            await handleFinalize(selected.id, "complete");
            setSelected(null);
          } finally {
            setModalBusy(false);
          }
        }}
        onCancel={async () => {
          if (!selected) return;
          setModalBusy(true);
          setModalBusyText("Canceling…");
          try {
            await handleFinalize(selected.id, "cancel_release");
            setSelected(null);
          } finally {
            setModalBusy(false);
          }
        }}
        onNoShow={async () => {
          if (!selected) return;
          setModalBusy(true);
          setModalBusyText("Marking no-show…");
          try {
            await handleFinalize(selected.id, "no_show_charge");
            setSelected(null);
          } finally {
            setModalBusy(false);
          }
        }}
      />
    </div>
  );
}
