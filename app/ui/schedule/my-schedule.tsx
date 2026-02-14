"use client";

import { useEffect, useMemo, useState } from "react";
import { formatInTimeZone } from "date-fns-tz";
import { fromZonedTime } from "date-fns-tz/fromZonedTime";

const TZ = "America/Chicago";

type Bucket = "upcoming" | "past";

type SessionItem = {
  id: string;
  start: string; // UTC ISO (ends with Z)
  end: string; // UTC ISO (ends with Z)
  status: "scheduled" | "completed" | "cancelled" | "no_show" | string;
  coachName: string | null;
  serviceTitle: string | null;
};

type ApiResponse = {
  ok: boolean;
  sessions?: SessionItem[];
  error?: string;
  detail?: string;
};

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function statusPillClasses(status: string) {
  switch (status) {
    case "scheduled":
      return "bg-blue-50 text-blue-700 border-blue-200";
    case "completed":
      return "bg-green-50 text-green-700 border-green-200";
    case "cancelled":
      return "bg-red-50 text-red-700 border-red-200";
    case "no_show":
      return "bg-amber-50 text-amber-800 border-amber-200";
    default:
      return "bg-slate-50 text-slate-700 border-slate-200";
  }
}

function monthRangeUtc(monthValue: string) {
  const [y, m] = monthValue.split("-").map(Number);

  // Chicago-local midnight boundaries
  const startLocal = new Date(y, m - 1, 1, 0, 0, 0);
  const endLocal = new Date(y, m, 1, 0, 0, 0);

  // Convert "Chicago wall clock" to real UTC instants for the API query
  const startUtc = fromZonedTime(startLocal, TZ);
  const endUtc = fromZonedTime(endLocal, TZ);

  return { startUtcIso: startUtc.toISOString(), endUtcIso: endUtc.toISOString() };
}

/** Small icon helpers (no deps) */
function CalendarIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M8 3v2M16 3v2M4.5 9.5h15"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M7 5h10a3 3 0 0 1 3 3v11a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3V8a3 3 0 0 1 3-3Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CloseIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M7 7l10 10M17 7L7 17"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** iOS-ish toggle */
function Switch({
  checked,
  onChange,
  disabled,
  label,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  disabled?: boolean;
  label?: string;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cx(
        "inline-flex items-center gap-2 select-none",
        disabled && "opacity-60 cursor-not-allowed"
      )}
      aria-pressed={checked}
      aria-label={label ?? "Toggle"}
    >
      {label ? <span className="text-sm font-semibold text-black/70">{label}</span> : null}
      <span
        className={cx(
          "relative h-6 w-11 rounded-full border transition",
          checked ? "bg-emerald-500 border-emerald-500" : "bg-slate-200 border-slate-300"
        )}
      >
        <span
          className={cx(
            "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition",
            checked ? "left-[22px]" : "left-0.5"
          )}
        />
      </span>
    </button>
  );
}

/** Bottom sheet */
function BottomSheet({
  open,
  title,
  children,
  onClose,
}: {
  open: boolean;
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* backdrop */}
      <button
        type="button"
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-label="Close"
      />
      {/* sheet */}
      <div className="absolute inset-x-0 bottom-0 mx-auto max-w-xl">
        <div className="rounded-t-3xl bg-white shadow-2xl border border-slate-200">
          <div className="flex items-center justify-between px-5 pt-4">
            <div className="w-10" />
            <div className="text-center text-base font-semibold text-red-600">{title}</div>
            <button
              type="button"
              onClick={onClose}
              className="h-10 w-10 rounded-full grid place-items-center text-slate-500 hover:bg-slate-100"
              aria-label="Close sheet"
            >
              <CloseIcon className="h-5 w-5" />
            </button>
          </div>

          <div className="px-5 pb-6 pt-3">{children}</div>

          {/* safe-area padding */}
          <div className="h-2" />
        </div>
      </div>
    </div>
  );
}

export default function MySchedule() {
  const [bucket, setBucket] = useState<Bucket>("upcoming");
  const [sessions, setSessions] = useState<SessionItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [expandedDays, setExpandedDays] = useState<Set<string>>(new Set()); // kept (unused now, but leaving as-is)

  const [month, setMonth] = useState(() => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    return `${y}-${m}`;
  });

  // local-only "remind me" toggles
  const [remindMap, setRemindMap] = useState<Record<string, boolean>>({});

  // cancel bottom sheet
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelTarget, setCancelTarget] = useState<SessionItem | null>(null);

  // details bottom sheet
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [detailsTarget, setDetailsTarget] = useState<SessionItem | null>(null);

  useEffect(() => {
    let mounted = true;

    (async () => {
      setLoading(true);
      setError("");

      try {
        let url = `/api/sessions/mine?limit=50`;

        if (bucket === "upcoming") {
          url = `/api/sessions/mine?bucket=upcoming&limit=50`;
        }

        if (bucket === "past") {
          const { startUtcIso, endUtcIso } = monthRangeUtc(month);
          url =
            `/api/sessions/mine?bucket=past` +
            `&start=${encodeURIComponent(startUtcIso)}` +
            `&end=${encodeURIComponent(endUtcIso)}` +
            `&limit=200`;
        }

        const res = await fetch(url, {
          credentials: "include",
          cache: "no-store",
        });

        const data = (await res.json()) as ApiResponse;
        if (!res.ok || !data?.ok) throw new Error(data?.detail || data?.error || "Failed");

        if (mounted) {
          setSessions(data.sessions ?? []);

          // initialize remind defaults (scheduled upcoming -> on, others off)
          setRemindMap((prev) => {
            const next = { ...prev };
            for (const s of data.sessions ?? []) {
              if (next[s.id] === undefined) {
                next[s.id] = bucket === "upcoming" && s.status === "scheduled";
              }
            }
            return next;
          });
        }
      } catch (e: any) {
        if (mounted) {
          setSessions([]);
          setError(e?.message ?? "Failed to load schedule");
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [bucket, month]);

  // Group sessions by Chicago-local date label
  const grouped = useMemo(() => {
    const map = new Map<string, SessionItem[]>();

    for (const s of sessions) {
      const dayKey = formatInTimeZone(new Date(s.start), TZ, "EEEE, MMM d, yyyy");
      const arr = map.get(dayKey) ?? [];
      arr.push(s);
      map.set(dayKey, arr);
    }

    for (const [k, arr] of map.entries()) {
      arr.sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
      map.set(k, arr);
    }

    return Array.from(map.entries());
  }, [sessions]);

  function toggleDay(dayLabel: string) {
    // kept for compatibility (not used in this UI)
    setExpandedDays((prev) => {
      const next = new Set(prev);
      if (next.has(dayLabel)) next.delete(dayLabel);
      else next.add(dayLabel);
      return next;
    });
  }

  async function cancelSession(sessionId: string) {
    try {
      const res = await fetch(`/api/sessions/${sessionId}/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ reason: "Cancelled by client" }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data?.ok) {
        throw new Error(data?.detail || data?.error || "Cancel failed");
      }

      // ✅ Update UI immediately
      setSessions((prev) =>
        prev.map((s) => (String(s.id) === String(sessionId) ? { ...s, status: "cancelled" } : s))
      );

      console.log("[cancel] result:", {
        sessionId,
        refundable: data.refundable,
        policy: data.policy, // "release" | "consume"
        minutesUntilStart: data.minutesUntilStart,
        creditApplied: data.creditApplied,
        alreadyCancelled: data.alreadyCancelled,
      });
    } catch (e: any) {
      alert(e?.message ?? "Failed to cancel session");
    }
  }

  function openCancelSheet(s: SessionItem) {
    setCancelTarget(s);
    setCancelOpen(true);
  }

  function openDetailsSheet(s: SessionItem) {
    setDetailsTarget(s);
    setDetailsOpen(true);
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
        <div>
          <h2 className="text-xl! font-semibold! text-black!">My Schedule</h2>
          <p className="text-sm! text-black/70!">Times shown in Central Time (Chicago).</p>
        </div>

        <div className="flex flex-col gap-2 sm:items-end">
          {/* Segmented tabs */}
          <div className="inline-flex w-fit rounded-2xl bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => setBucket("upcoming")}
              className={cx(
                "px-4 py-2 text-sm font-semibold rounded-2xl transition",
                bucket === "upcoming"
                  ? "bg-white text-black shadow-sm"
                  : "text-black/70 hover:text-black"
              )}
            >
              Upcoming
            </button>
            <button
              type="button"
              onClick={() => setBucket("past")}
              className={cx(
                "px-4 py-2 text-sm font-semibold rounded-2xl transition",
                bucket === "past" ? "bg-white text-black shadow-sm" : "text-black/70 hover:text-black"
              )}
            >
              Past
            </button>
          </div>

          {bucket === "past" && (
            <div className="w-fit">
              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-3">
                <label className="text-sm! font-semibold! text-black!" htmlFor="month">
                  Select Month
                </label>
                <input
                  id="month"
                  type="month"
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-black shadow-sm"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="text-sm text-black/70">Loading…</div>
      ) : error ? (
        <div className="text-sm text-red-700">{error}</div>
      ) : sessions.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-black/70">
          {bucket === "upcoming" ? "No upcoming sessions yet." : "No past sessions found."}
        </div>
      ) : (
        <div className="space-y-5">
          {grouped.map(([dayLabel, daySessions]) => {
            // (optional) you can bring back collapsible days by using expandedDays + toggleDay
            // for the new "app" feel, we keep days always expanded.
            return (
              <div key={dayLabel} className="space-y-3">
                {/* Day header */}
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold text-black/80">{dayLabel}</div>
                  {/* kept hook for future (collapse) */}
                  <button
                    type="button"
                    onClick={() => toggleDay(dayLabel)}
                    className="hidden"
                    aria-hidden="true"
                  />
                </div>

                {/* Cards */}
                <div className="space-y-3">
                  {daySessions.map((s) => {
                    const startTime = formatInTimeZone(new Date(s.start), TZ, "h:mm a");
                    const endTime = formatInTimeZone(new Date(s.end), TZ, "h:mm a");
                    const service = s.serviceTitle ?? "Session";

                    const canCancel = bucket === "upcoming" && s.status === "scheduled";
                    const remindEnabled = Boolean(remindMap[s.id]);

                    return (
                      <div
                        key={s.id}
                        className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden"
                      >
                        {/* Card header row (like screenshot: date/time + remind toggle) */}
                        <div className="flex items-start justify-between gap-3 px-4 pt-4">
                          <div className="flex items-start gap-3 min-w-0">
                            <div className="mt-0.5 h-9 w-9 rounded-xl bg-slate-100 grid place-items-center text-slate-700 shrink-0">
                              <CalendarIcon className="h-5 w-5" />
                            </div>

                            <div className="min-w-0">
                              <div className="text-sm font-semibold text-black truncate">
                                {startTime} — {endTime}
                              </div>
                              <div className="text-xs text-black/60 truncate">{service}</div>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 shrink-0">
                            {/* status pill */}
                            <span
                              className={cx(
                                "inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide",
                                statusPillClasses(s.status)
                              )}
                            >
                              {String(s.status).replace("_", " ")}
                            </span>

                            {/* remind toggle like screenshot */}
                            <Switch
                              label="Remind me"
                              checked={remindEnabled}
                              disabled={!canCancel && bucket === "past"} // optional: disable in past
                              onChange={(next) =>
                                setRemindMap((prev) => ({ ...prev, [s.id]: next }))
                              }
                            />
                          </div>
                        </div>

                        {/* Card body (coach, etc.) */}
                        <div className="px-4 pb-4 pt-3">
                          <div className="grid gap-2">
                            <div className="flex items-center justify-between gap-3">
                              <div className="text-sm font-semibold text-black truncate">
                                {service}
                              </div>
                              <div className="text-xs text-black/60 shrink-0">
                                Duration{" "}
                                <span className="font-semibold text-black/80">
                                  {/* quick duration calc */}
                                  {Math.max(
                                    0,
                                    Math.round(
                                      (new Date(s.end).getTime() - new Date(s.start).getTime()) /
                                        60000
                                    )
                                  )}{" "}
                                  min
                                </span>
                              </div>
                            </div>

                            {s.coachName ? (
                              <div className="text-sm text-black/70 truncate">
                                Coach: <span className="font-semibold text-black/80">{s.coachName}</span>
                              </div>
                            ) : null}
                          </div>

                          {/* Buttons row (like screenshot) */}
                          <div className="mt-4 grid grid-cols-2 gap-3">
                            <button
                              type="button"
                              onClick={() => openCancelSheet(s)}
                              disabled={!canCancel}
                              className={cx(
                                "rounded-2xl border px-4 py-3 text-sm font-semibold transition",
                                canCancel
                                  ? "border-emerald-700/30 text-emerald-800 hover:bg-emerald-50"
                                  : "border-slate-200 text-slate-400 bg-slate-50 cursor-not-allowed"
                              )}
                            >
                              Cancel Booking
                            </button>

                            <button
                              type="button"
                              onClick={() => openDetailsSheet(s)}
                              className="rounded-2xl bg-emerald-700 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-800 transition"
                            >
                              View Details
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Cancel Bottom Sheet */}
      <BottomSheet
        open={cancelOpen}
        title="Cancel Booking?"
        onClose={() => {
          setCancelOpen(false);
          setCancelTarget(null);
        }}
      >
        <div className="text-center text-sm text-black/80">
          Are you sure you want to cancel the booking?
          <div className="mt-2 text-xs text-black/60">
            Cancels within 24 hours may still consume the credit.
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => {
              setCancelOpen(false);
              setCancelTarget(null);
            }}
            className="rounded-2xl border border-emerald-700/30 px-4 py-3 text-sm font-semibold text-emerald-800 hover:bg-emerald-50 transition"
          >
            No, Don&apos;t Cancel
          </button>

          <button
            type="button"
            onClick={async () => {
              if (!cancelTarget) return;
              const id = cancelTarget.id;
              setCancelOpen(false);
              setCancelTarget(null);
              await cancelSession(id);
            }}
            className="rounded-2xl bg-emerald-700 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-800 transition"
          >
            Yes, Cancel
          </button>
        </div>
      </BottomSheet>

      {/* Details Bottom Sheet */}
      <BottomSheet
        open={detailsOpen}
        title="Session Details"
        onClose={() => {
          setDetailsOpen(false);
          setDetailsTarget(null);
        }}
      >
        {detailsTarget ? (
          <div className="space-y-3">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="text-sm font-semibold text-black">
                {detailsTarget.serviceTitle ?? "Session"}
              </div>
              <div className="mt-1 text-sm text-black/70">
                {formatInTimeZone(new Date(detailsTarget.start), TZ, "EEEE, MMM d")} ·{" "}
                {formatInTimeZone(new Date(detailsTarget.start), TZ, "h:mm a")} –{" "}
                {formatInTimeZone(new Date(detailsTarget.end), TZ, "h:mm a")}
              </div>
              {detailsTarget.coachName ? (
                <div className="mt-1 text-sm text-black/70">
                  Coach: <span className="font-semibold text-black/80">{detailsTarget.coachName}</span>
                </div>
              ) : null}
              <div className="mt-3">
                <span
                  className={cx(
                    "inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide",
                    statusPillClasses(detailsTarget.status)
                  )}
                >
                  {String(detailsTarget.status).replace("_", " ")}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setDetailsOpen(false);
                setDetailsTarget(null);
              }}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-black/80 hover:bg-slate-50 transition"
            >
              Close
            </button>
          </div>
        ) : null}
      </BottomSheet>
    </div>
  );
}
