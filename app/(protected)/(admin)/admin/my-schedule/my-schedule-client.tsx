"use client";

import { useEffect, useMemo, useState } from "react";
import { DayOfWeekSelect, type DayOfWeek } from "@/app/ui/components/select/day-of-week";
import { ExceptionTypeSelect, type ExceptionType } from "@/app/ui/components/select/exception-type";
import { TimeSelect } from "@/app/ui/components/select/time";

const TZ = "America/Chicago";

type Rule = {
  id: number;
  coach_id: number;
  day_of_week: number; // 0-6
  start_time: string; // "HH:MM:SS" or "HH:MM"
  end_time: string;
  timezone: string;
  is_active: 0 | 1;
};

type ExceptionRow = {
  id: number;
  coach_id: number;
  date: string; // "YYYY-MM-DD"
  start_time: string | null; // "HH:MM:SS" or null
  end_time: string | null;
  type: "blocked" | "custom";
  note: string | null;
};

type OverviewResponse = {
  ok: boolean;
  rules: Rule[];
  exceptions: ExceptionRow[];
};

type HolidaySuggestion = {
  key: string;
  name: string;
  date: string; // YYYY-MM-DD
};

const DOW_LABELS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function toHHMM(t: string) {
  if (!t) return "";
  return t.slice(0, 5);
}

function formatTime12(t: string) {
  const hhmm = toHHMM(t); // "09:00"
  if (!hhmm) return "";

  const [h, m] = hhmm.split(":").map(Number);
  const d = new Date();
  d.setHours(h, m, 0, 0);

  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(d);
}

function ymd(d: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function addDays(d: Date, n: number) {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

function nextOrThisYear(monthIndex0: number, day: number, today = new Date()) {
  const y = today.getFullYear();
  const d0 = new Date(y, monthIndex0, day);
  if (d0 < new Date(today.getFullYear(), today.getMonth(), today.getDate())) {
    return new Date(y + 1, monthIndex0, day);
  }
  return d0;
}

// Thanksgiving: 4th Thursday in November
function thanksgivingDate(year: number) {
  const nov1 = new Date(year, 10, 1); // 10 = Nov
  const day = nov1.getDay(); // 0 Sun .. 6 Sat
  const firstThuOffset = (4 - day + 7) % 7; // 4 = Thu
  const firstThu = addDays(nov1, firstThuOffset);
  return addDays(firstThu, 21); // 4th Thu = first + 3 weeks
}

function upcomingHolidaySuggestions(rangeDays = 180): HolidaySuggestion[] {
  const today = new Date();
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const end = addDays(start, rangeDays);

  const year = start.getFullYear();
  const candidates: { key: string; name: string; date: Date }[] = [];

  // Fixed date holidays (US-centric)
  candidates.push({ key: "new_years_day", name: "New Year’s Day", date: nextOrThisYear(0, 1, start) });
  candidates.push({ key: "independence_day", name: "Fourth of July", date: nextOrThisYear(6, 4, start) });
  candidates.push({ key: "christmas_eve", name: "Christmas Eve", date: nextOrThisYear(11, 24, start) });
  candidates.push({ key: "christmas_day", name: "Christmas Day", date: nextOrThisYear(11, 25, start) });
  candidates.push({ key: "new_years_eve", name: "New Year’s Eve", date: nextOrThisYear(11, 31, start) });

  // Thanksgiving (4th Thu of Nov) — add for this year and next year
  const tgThis = thanksgivingDate(year);
  const tgNext = thanksgivingDate(year + 1);
  candidates.push({ key: "thanksgiving", name: "Thanksgiving", date: tgThis < start ? tgNext : tgThis });

  // Easter is computable but longer; simplest: let admin add manually OR compute later.
  // If you want it computed, tell me and I’ll drop in the algorithm.

  // Filter to range
  return candidates
    .filter((c) => c.date >= start && c.date <= end)
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .map((c) => ({ key: c.key, name: c.name, date: ymd(c.date) }));
}

export default function MyScheduleClient({ coachId }: { coachId: number }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [error, setError] = useState<string>("");

  const [rules, setRules] = useState<Rule[]>([]);
  const [exceptions, setExceptions] = useState<ExceptionRow[]>([]);

  // Rule form
  const [ruleDay, setRuleDay] = useState<DayOfWeek>(1);
  const [ruleStart, setRuleStart] = useState("09:00");
  const [ruleEnd, setRuleEnd] = useState("17:00");

  // Exception form
  const [exDate, setExDate] = useState<string>("");
  const [exType, setExType] = useState<ExceptionType>("blocked");
  const [exStart, setExStart] = useState("09:00");
  const [exEnd, setExEnd] = useState("12:00");
  const [exNote, setExNote] = useState("");

  const suggested = useMemo(() => upcomingHolidaySuggestions(180), []);
const exceptionDates = useMemo(() => new Set(exceptions.map(e => e.date)), [exceptions]);

  async function load() {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/admin/my-schedule", { cache: "no-store" });
      const data = (await res.json()) as OverviewResponse;

      if (!res.ok || !data.ok) throw new Error("Failed to load schedule.");

      setRules(data.rules ?? []);
      setExceptions(data.exceptions ?? []);
    } catch (e: any) {
      setError(e?.message ?? "Failed to load schedule.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const rulesByDay = useMemo(() => {
    const map: Record<number, Rule[]> = { 0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] };
    for (const r of rules) map[r.day_of_week]?.push(r);
    for (const k of Object.keys(map)) {
      map[Number(k)].sort((a, b) => a.start_time.localeCompare(b.start_time));
    }
    return map;
  }, [rules]);

  async function addRule() {
    setError("");
    setSaving("rule");

    try {
      const res = await fetch("/api/admin/my-schedule/rules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          coachId,
          day_of_week: ruleDay,
          start_time: ruleStart,
          end_time: ruleEnd,
          timezone: TZ,
        }),
      });

      const body = await res.json();
      if (!res.ok || !body.ok) throw new Error(body?.message || "Failed to add rule.");

      // simplest: reload overview
      await load();
    } catch (e: any) {
      setError(e?.message ?? "Failed to add rule.");
    } finally {
      setSaving(null);
    }
  }

  async function deleteRule(id: number) {
    setError("");
    setSaving(`rule:${id}`);

    try {
      const res = await fetch("/api/admin/my-schedule/rules", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      const body = await res.json();
      if (!res.ok || !body.ok) throw new Error(body?.message || "Failed to delete rule.");

      setRules((prev) => prev.filter((r) => r.id !== id));
    } catch (e: any) {
      setError(e?.message ?? "Failed to delete rule.");
    } finally {
      setSaving(null);
    }
  }


  async function addException() {
    setError("");
    setSaving("exception");

    try {
      const payload =
        exType === "blocked"
          ? {
              coachId,
              date: exDate,
              type: "blocked",
              note: exNote.trim() || null,
            }
          : {
              coachId,
              date: exDate,
              type: "custom",
              start_time: exStart,
              end_time: exEnd,
              note: exNote.trim() || null,
            };

      const res = await fetch("/api/admin/my-schedule/exceptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload), // 👈 THIS IS THE POST PAYLOAD
      });

      const body = await res.json();
      if (!res.ok || !body.ok) throw new Error(body?.message || "Failed to add exception.");

      await load();
    } catch (e: any) {
      setError(e?.message ?? "Failed to add exception.");
    } finally {
      setSaving(null);
    }
  } // ✅ CLOSE addException()

  async function deleteException(id: number) {
    setError("");
    setSaving(`exception:${id}`);

    try {
      const res = await fetch("/api/admin/my-schedule/exceptions", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      const body = await res.json();
      if (!res.ok || !body.ok) throw new Error(body?.message || "Failed to delete exception.");

      setExceptions((prev) => prev.filter((x) => x.id !== id));
    } catch (e: any) {
      setError(e?.message ?? "Failed to delete exception.");
    } finally {
      setSaving(null);
    }
  }

  function applySuggestedCustom(date: string, type: "blocked" | "custom") {
    setExDate(date);
    setExType(type);
    setExStart(ruleStart);
    setExEnd(ruleEnd);
    setExNote("");
  }

  return (
    <div className="space-y-6">
      {error ? (
        <div className="rounded-2xl border border-red-200 bg-white p-4 text-sm text-red-600">
          {error}
        </div>
      ) : null}

      {/* Weekly Rules */}
      <div className="rounded-2xl border border-grey-300 bg-white p-5 shadow-sm space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-lg font-semibold text-grey-700">Weekly Availability</div>
            <div className="text-sm text-grey-500">
              These rules repeat every week (Central Time).
            </div>
          </div>
          <button
            className="rounded-xl border border-grey-300 bg-white px-3 py-2 text-sm text-grey-700 shadow-sm hover:bg-grey-100"
            onClick={load}
            disabled={loading || !!saving}
          >
            Refresh
          </button>
        </div>

        {/* Add rule */}
        <div className="grid gap-3 sm:grid-cols-4 items-end">
          <div>
            <label className="text-xs text-grey-500">Day</label>
            <DayOfWeekSelect
              value={ruleDay}
              onChange={(d) => d !== null && setRuleDay(d)}
              disabled={!!saving}
            />
          </div>

          <div>
            <label className="text-xs text-grey-500">Start</label>
            <TimeSelect value={ruleStart} onChange={setRuleStart} disabled={!!saving} />
          </div>

          <div>
            <label className="text-xs text-grey-500">End</label>
            <TimeSelect value={ruleEnd} onChange={setRuleEnd} disabled={!!saving} />
          </div>

          <button
            className="rounded-xl bg-grey-700 px-4 py-2 text-sm font-semibold text-white hover:bg-grey-900 disabled:opacity-50"
            onClick={addRule}
            disabled={!!saving || !ruleStart || !ruleEnd}
          >
            {saving === "rule" ? "Saving…" : "Add rule"}
          </button>
        </div>

        {/* Rules list */}
        {loading ? (
          <div className="text-sm text-grey-500">Loading…</div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {Object.keys(rulesByDay).map((k) => {
              const day = Number(k);
              const list = rulesByDay[day] ?? [];
              return (
                <div key={day} className="rounded-2xl border border-grey-200 p-4">
                  <div className="font-semibold text-grey-700">{DOW_LABELS[day]}</div>
                  <div className="mt-2 space-y-2">
                    {list.length === 0 ? (
                      <div className="text-sm text-grey-500">No rules.</div>
                    ) : (
                      list.map((r) => (
                        <div
                          key={r.id}
                          className="flex items-center justify-between gap-2 rounded-xl border border-grey-200 bg-grey-100 px-3 py-2"
                        >
                          <div className="text-sm text-grey-700">
                            {formatTime12(r.start_time)} – {formatTime12(r.end_time)}
                          </div>
                          <button
                            className="text-xs font-semibold text-red-600 hover:underline disabled:opacity-50"
                            onClick={() => deleteRule(r.id)}
                            disabled={saving === `rule:${r.id}` || !!saving}
                          >
                            {saving === `rule:${r.id}` ? "…" : "Delete"}
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Exceptions */}
      <div className="rounded-2xl border border-grey-300 bg-white p-5 shadow-sm space-y-4">
        <div>
          <div className="text-lg font-semibold text-grey-700">Exceptions</div>
          <div className="text-sm text-grey-500">
            Block a full day or create a custom availability window for a specific date.
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-5 items-end">
          {/* Date */}
          <div className="pb-[1px]">
            <label className="text-xs text-grey-500">Date</label>
            <input
              type="date"
              className="mt-1 w-full rounded-2xl border border-grey-300 bg-white px-3 py-[10px] text-sm! text-grey-700! font-medium! shadow-sm outline-none focus:border-grey-500"
              value={exDate}
              onChange={(e) => setExDate(e.target.value)}
              disabled={!!saving}
            />
          </div>

          {/* Type */}
          <div>
            <label className="text-xs text-grey-500">Type</label>
            <div className="mt-1">
              <ExceptionTypeSelect
                value={exType}
                onChange={setExType} 
                disabled={!!saving}
                menuClassName="overflow-y-auto"
                dropdownPlacement="top"
              />
            </div>
          </div>

          {/* Start */}
          <div>
            <label className="text-xs text-grey-500">Start</label>
            <div className="mt-1">
              <TimeSelect
                value={exStart}
                onChange={setExStart}
                disabled={!!saving || exType !== "custom"}
                stepMinutes={15}
                min="05:00"
                max="22:00"
                placeholder="Start"
                menuClassName="overflow-y-auto"
                dropdownPlacement="top"
              />
            </div>
          </div>

          {/* End */}
          <div>
            <label className="text-xs text-grey-500">End</label>
            <div className="mt-1">
              <TimeSelect
                value={exEnd}
                onChange={setExEnd}
                disabled={!!saving || exType !== "custom"}
                stepMinutes={15}
                min="05:00"
                max="22:00"
                placeholder="End"
                menuClassName="overflow-y-auto"
                dropdownPlacement="top"
              />
            </div>
          </div>

          {/* Add */}
          <button
            className="rounded-xl bg-grey-700 px-4 py-2 text-sm font-semibold text-white hover:bg-grey-900 disabled:opacity-50"
            onClick={addException}
            disabled={!!saving || !exDate || (exType === "custom" && (!exStart || !exEnd))}
          >
            {saving === "exception" ? "Saving…" : "Add exception"}
          </button>
        </div>

        {/* Note */}
        <div>
          <label className="text-xs text-grey-500">Note (optional)</label>
          <input
            className="mt-1 w-full rounded-xl border border-grey-300 bg-white px-3 py-2 text-sm text-grey-700 shadow-sm outline-none focus:border-grey-500"
            value={exNote}
            onChange={(e) => setExNote(e.target.value)}
            placeholder="e.g. Out of town"
            disabled={!!saving}
          />
        </div>

        {/* Existing exceptions list */}
        <div className="space-y-2">
          {exceptions.length === 0 ? (
            <div className="text-sm text-grey-500">No exceptions yet.</div>
          ) : (
            exceptions
              .slice()
              .sort((a, b) => b.date.localeCompare(a.date))
              .map((x) => (
                <div
                  key={x.id}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-grey-200 p-4"
                >
                  <div className="space-y-0.5">
                    <div className="font-semibold text-grey-700">
                      {x.date}{" "}
                      <span className="text-xs font-medium text-grey-500">({x.type})</span>
                    </div>
                    <div className="text-sm text-grey-600">
                      {x.type === "blocked"
                        ? "Blocked all day"
                        : `${formatTime12(x.start_time ?? "")} – ${formatTime12(x.end_time ?? "")}`}
                    </div>
                    {x.note ? <div className="text-xs text-grey-500">{x.note}</div> : null}
                  </div>

                  <button
                    className="text-xs font-semibold text-red-600 hover:underline disabled:opacity-50"
                    onClick={() => deleteException(x.id)}
                    disabled={saving === `exception:${x.id}` || !!saving}
                  >
                    {saving === `exception:${x.id}` ? "…" : "Delete"}
                  </button>
                </div>
              ))
          )}
        </div>

        {/* Suggested upcoming blocks */}
        <div className="rounded-2xl border border-grey-200 bg-grey-100 p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-semibold text-grey-700">Suggested upcoming days</div>
              <div className="text-xs text-grey-500">Quick-add common holidays (next 6 months).</div>
            </div>
          </div>

          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {suggested.length === 0 ? (
              <div className="text-sm text-grey-500">No upcoming suggestions.</div>
            ) : (
              suggested.map((h) => {
                const already = exceptionDates.has(h.date);
                return (
                  <div
                    key={h.key}
                    className="flex items-center justify-between gap-3 rounded-2xl border border-grey-200 bg-white px-3 py-2"
                  >
                    <div className="min-w-0">
                      <div className="font-medium text-grey-700 truncate">{h.name}</div>
                      <div className="text-xs text-grey-500">{h.date}</div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        className="rounded-xl border border-grey-300 bg-white px-3 py-1.5 text-xs font-semibold text-grey-700 shadow-sm hover:bg-grey-100 disabled:opacity-50"
                        onClick={() => applySuggestedCustom(h.date, "blocked")}
                        disabled={already || !!saving}
                      >
                        {already ? "Added" : "Block"}
                      </button>

                      <button
                        className="rounded-xl bg-grey-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-grey-900 disabled:opacity-50"
                        onClick={() => applySuggestedCustom(h.date, "custom")}
                        disabled={already || !!saving}
                      >
                        Custom
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};