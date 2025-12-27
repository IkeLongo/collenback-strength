"use client";

import { useEffect, useMemo, useState } from "react";
import { formatInTimeZone } from "date-fns-tz";
import { fromZonedTime } from "date-fns-tz/fromZonedTime";

const TZ = "America/Chicago";

type Bucket = "upcoming" | "past";

type SessionItem = {
  id: string;
  start: string; // UTC ISO (ends with Z)
  end: string;   // UTC ISO (ends with Z)
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

export default function MySchedule() {
  const [bucket, setBucket] = useState<Bucket>("upcoming");
  const [sessions, setSessions] = useState<SessionItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const [month, setMonth] = useState(() => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    return `${y}-${m}`;
  });

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

        if (mounted) setSessions(data.sessions ?? []);
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
      const dayKey = formatInTimeZone(new Date(s.start), TZ, "EEEE, MMM d");
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

  return (
    <div className="rounded-xl border p-4 space-y-4 bg-white">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
        <div>
          <h2 className="text-xl! font-semibold! text-black!">My Schedule</h2>
          <p className="text-sm! text-black/70!">Times shown in Central Time (Chicago).</p>
        </div>

        <div className="flex flex-col gap-2 sm:items-end">
          <div
            className={[
              "flex flex-row text-sm transition",
              bucket === "upcoming"
                ? ""
                : "bg-grey-50 text-grey-700 hover:text-grey-900",
            ].join(" ")}
          >
            <button
              type="button"
              onClick={() => setBucket("upcoming")}
              className={cx(
                "px-3 py-1.5 text-sm font-semibold transition border-b-[2px] border-b-grey-100",
                bucket === "upcoming"
                  ? "text-grey-700 font-semibold! border-b-[3px] border-b-grey-500"
                  : "bg-grey-50 text-grey-700 hover:text-grey-900",
              )}
            >
              Upcoming
            </button>
            <button
              type="button"
              onClick={() => setBucket("past")}
              className={cx(
                "px-3 py-1.5 text-sm font-semibold transition border-b-[2px] border-b-grey-100",
                bucket === "past"
                  ? "text-grey-700 font-semibold! border-b-[3px] border-b-grey-500"
                  : "bg-grey-50 text-grey-700 hover:text-grey-900",
              )}
            >
              Past
            </button>
          </div>

          {bucket === "past" && (
            <div className="w-fit mt-1">
              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-3">
                <label className="text-sm! font-semibold! text-black! text-left" htmlFor="month">
                  Select Month
                </label>
                <input
                  id="month"
                  type="month"
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                  className="rounded-md border px-3 py-2 text-sm text-black"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {loading ? (
        <div className="text-sm text-black/70">Loading…</div>
      ) : error ? (
        <div className="text-sm text-red-700">{error}</div>
      ) : sessions.length === 0 ? (
        <div className="rounded-lg border bg-slate-50 p-4 text-sm text-black/70">
          {bucket === "upcoming" ? "No upcoming sessions yet." : "No past sessions found."}
        </div>
      ) : (
        <div className="space-y-4">
          {grouped.map(([dayLabel, daySessions]) => (
            <div key={dayLabel} className="rounded-xl border overflow-hidden">
              <div className="bg-slate-50 px-4 py-2 border-b">
                <div className="text-sm font-semibold text-black">{dayLabel}</div>
              </div>

              <ul className="divide-y">
                {daySessions.map((s) => {
                  const startLabel = formatInTimeZone(new Date(s.start), TZ, "h:mm a");
                  const endLabel = formatInTimeZone(new Date(s.end), TZ, "h:mm a");

                  return (
                    <li key={s.id} className="px-4 py-3 flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="font-semibold text-black">
                          {startLabel}–{endLabel}
                        </div>
                        <div className="text-sm text-black/70 truncate">
                          {s.serviceTitle ?? "Session"}
                        </div>
                        <div className="text-sm text-black/70 truncate">
                          {s.coachName ? `Coach: ${s.coachName}` : ""}
                        </div>
                      </div>

                      <span
                        className={cx(
                          "shrink-0 inline-flex items-center rounded-full border px-2 py-1 text-xs font-semibold uppercase tracking-wide",
                          statusPillClasses(s.status)
                        )}
                      >
                        {String(s.status).replace("_", " ")}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}