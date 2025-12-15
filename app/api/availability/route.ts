import { NextResponse } from "next/server";
import { pool } from "@/app/lib/mysql";
import type { RowDataPacket } from "mysql2/promise";
import { addDays, format, isBefore } from "date-fns";
import {
  fromZonedTime,
  toZonedTime,
  formatInTimeZone,
} from "date-fns-tz";
import is from "zod/v4/locales/is.cjs";

type SlotOption = {
  durationMinutes: number;
  end: string;
};

type SlotGroup = {
  start: string;
  options: SlotOption[];
};

const TZ = "America/Chicago";

// 15-minute step
const STEP_MIN = 15;
const DURATIONS = [30, 60] as const;

function toYMD(d: Date) {
  return format(d, "yyyy-MM-dd");
}

function dateToMysqlUtc(dt: Date) {
  // dt is a JS Date representing a UTC instant
  return dt.toISOString().slice(0, 19).replace("T", " ");
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const coachId = Number(searchParams.get("coachId"));
  const start = searchParams.get("start"); // UTC ISO
  const end = searchParams.get("end");     // UTC ISO

  if (!coachId || !start || !end) {
    return NextResponse.json(
      { ok: false, error: "missing_params", required: ["coachId", "start", "end"] },
      { status: 400 }
    );
  }

  const rangeStartUtc = new Date(start);
  const rangeEndUtc = new Date(end);

  // Debug logging
  // console.log("[availability] request", {
  //   coachId,
  //   start,
  //   end,
  //   rangeStartUtc: rangeStartUtc.toISOString(),
  //   rangeEndUtc: rangeEndUtc.toISOString(),
  //   rangeStartLocal: formatInTimeZone(rangeStartUtc, TZ, "yyyy-MM-dd HH:mm:ss XXX"),
  //   rangeEndLocal: formatInTimeZone(rangeEndUtc, TZ, "yyyy-MM-dd HH:mm:ss XXX"),
  // });

  if (isNaN(rangeStartUtc.getTime()) || isNaN(rangeEndUtc.getTime()) || rangeStartUtc >= rangeEndUtc) {
    return NextResponse.json({ ok: false, error: "invalid_datetime_range" }, { status: 400 });
  }

  // Convert the viewing window into Chicago "calendar days"
  const rangeStartLocal = toZonedTime(rangeStartUtc, TZ);
  const rangeEndLocal = toZonedTime(rangeEndUtc, TZ);

  // 1) Load availability rules that might apply in this range
  const [rules] = await pool.execute<RowDataPacket[]>(
    `
    SELECT id, coach_id, day_of_week, start_time, end_time, is_active
    FROM availability_rules
    WHERE coach_id = ?
      AND is_active = 1
    `,
    [coachId]
  );

  // Debug logging
  // console.log("[availability] rules", {
  //   count: rules.length,
  //   sample: rules.slice(0, 5).map((r) => ({
  //     id: r.id,
  //     day_of_week: r.day_of_week,
  //     start_time: String(r.start_time),
  //     end_time: String(r.end_time),
  //   })),
  // });

  // 2) Load exceptions (local dates)
  const [exceptions] = await pool.execute<RowDataPacket[]>(
    `
    SELECT id, coach_id, date, start_time, end_time, type, note
    FROM availability_exceptions
    WHERE coach_id = ?
      AND date BETWEEN DATE(?) AND DATE(?)
    `,
    [coachId, toYMD(rangeStartLocal), toYMD(rangeEndLocal)]
  );

  // Debug logging
  // console.log("[availability] exceptions", {
  //   count: exceptions.length,
  //   dates: Array.from(new Set(exceptions.map((e) => toYMD(new Date(e.date))))),
  // });

  // Index exceptions by date
  const exByDate = new Map<string, RowDataPacket[]>();
  for (const ex of exceptions) {
    const key = toYMD(new Date(ex.date)); // date comes back as Date/string
    const arr = exByDate.get(key) ?? [];
    arr.push(ex);
    exByDate.set(key, arr);
  }

  // 3) Load scheduled sessions in UTC for overlap filtering (one query)
  const [bookings] = await pool.execute<RowDataPacket[]>(
    `
    SELECT scheduled_start, scheduled_end
    FROM sessions
    WHERE coach_id = ?
      AND status = 'scheduled'
      AND scheduled_start < ?
      AND scheduled_end > ?
    `,
    [coachId, dateToMysqlUtc(rangeEndUtc), dateToMysqlUtc(rangeStartUtc)]
  );

  // Debug logging
  // console.log("[availability] busy sessions", {
  //   count: bookings.length,
  //   sample: bookings.slice(0, 3),
  // });

  function mysqlDatetimeToUtcMs(dt: string) {
    // "YYYY-MM-DD HH:MM:SS" -> "YYYY-MM-DDTHH:MM:SSZ"
    return Date.parse(dt.replace(" ", "T") + "Z");
  }

  const booked = bookings.map((b) => ({
    startMs: mysqlDatetimeToUtcMs(String(b.scheduled_start)),
    endMs: mysqlDatetimeToUtcMs(String(b.scheduled_end)),
  }));

  if (bookings[0]) {
    const raw = String(bookings[0].scheduled_start);
    console.log("[availability] busy sanity", {
      raw,
      asUtcIso: new Date(mysqlDatetimeToUtcMs(raw)).toISOString(),
      chicago: formatInTimeZone(new Date(mysqlDatetimeToUtcMs(raw)), "America/Chicago", "yyyy-MM-dd h:mm a XXX"),
    });
  }

  function overlapsAny(startMs: number, endMs: number) {
    return booked.some((x) => x.startMs < endMs && x.endMs > startMs);
  }

  // Helper: weekday mapping
  // Your schema: 0=Sun..6=Sat
  function dayOfWeekLocal(d: Date) {
    return d.getDay(); // JS: 0=Sun..6=Sat
  }

  // 4) Generate slots day-by-day in LOCAL time, convert each slot to UTC for overlap checks
  const slots: SlotGroup[] = [];
  const slotMap = new Map<string, SlotGroup>();

  // iterate local dates from startLocal to endLocal
  let cursor = new Date(rangeStartLocal);
  cursor.setHours(0, 0, 0, 0);

  const endCursor = new Date(rangeEndLocal);
  endCursor.setHours(0, 0, 0, 0);

  // cursor is already set to local start-of-day
  // endCursor is already set to local start-of-day for range end

  while (isBefore(cursor, endCursor)) {

    const ymd = toYMD(cursor);              // e.g. "2025-12-15"
    const dow = dayOfWeekLocal(cursor);     // 0=Sun..6=Sat

    const dayRules = rules.filter((r) => Number(r.day_of_week) === dow);
    const dayEx = exByDate.get(ymd) ?? [];

    // All-day blocked?
    const allDayBlocked = dayEx.some(
      (e) => e.type === "blocked" && !e.start_time && !e.end_time
    );

    // Build windows: recurring rules + custom exceptions
    const windows: Array<{ startTime: string; endTime: string }> = [];

    if (!allDayBlocked) {
      for (const r of dayRules) {
        windows.push({
          startTime: String(r.start_time), // "09:00:00"
          endTime: String(r.end_time),     // "17:00:00"
        });
      }
    }

    for (const e of dayEx) {
      if (e.type === "custom" && e.start_time && e.end_time) {
        windows.push({
          startTime: String(e.start_time),
          endTime: String(e.end_time),
        });
      }
    }

    // Partial blocks (convert to minute ranges)
    const partialBlocks = dayEx
      .filter((e) => e.type === "blocked" && e.start_time && e.end_time)
      .map((e) => {
        const s = String(e.start_time); // "HH:mm:ss"
        const t = String(e.end_time);

        const sMin = Number(s.slice(0, 2)) * 60 + Number(s.slice(3, 5));
        const eMin = Number(t.slice(0, 2)) * 60 + Number(t.slice(3, 5));
        return { startMin: sMin, endMin: eMin };
      });

    // Debug logging
    // console.log("[availability] day", {
    //   ymd,
    //   dow,
    //   windows: windows.length,
    //   partialBlocks: partialBlocks.length,
    //   allDayBlocked,
    // });

    // Helper to build a "naive" Date from ymd + HH:mm (interpreted later via fromZonedTime)
    function makeNaiveLocal(ymdStr: string, hh: string, mm: string) {
      // IMPORTANT: space (not "T") so JS doesn't apply ISO parsing rules
      return new Date(`${ymdStr} ${hh}:${mm}:00`);
    }

    function overlapsBlocked(slotStartMin: number, slotEndMin: number) {
      return partialBlocks.some(
        (b) => b.startMin < slotEndMin && b.endMin > slotStartMin
      );
    }

    for (const w of windows) {
      // Window minutes
      const ws = w.startTime; // "HH:mm:ss"
      const we = w.endTime;

      const winStartMin = Number(ws.slice(0, 2)) * 60 + Number(ws.slice(3, 5));
      const winEndMin   = Number(we.slice(0, 2)) * 60 + Number(we.slice(3, 5));

      // Start times every 15 minutes
      for (let startMin = winStartMin; startMin < winEndMin; startMin += STEP_MIN) {
        for (const dur of DURATIONS) {
          const endMin = startMin + dur;
          if (endMin > winEndMin) continue;

          // Apply partial blocked windows (local minutes)
          if (overlapsBlocked(startMin, endMin)) continue;

          // Build naive local start/end times for that day
          const sh = String(Math.floor(startMin / 60)).padStart(2, "0");
          const sm = String(startMin % 60).padStart(2, "0");
          const eh = String(Math.floor(endMin / 60)).padStart(2, "0");
          const em = String(endMin % 60).padStart(2, "0");

          const startNaive = makeNaiveLocal(ymd, sh, sm);
          const endNaive   = makeNaiveLocal(ymd, eh, em);

          // Convert Chicago local -> UTC (this is the ONLY place timezone conversion happens)
          const slotStartUtc = fromZonedTime(startNaive, TZ);
          const slotEndUtc   = fromZonedTime(endNaive, TZ);

          // Keep within requested window (UTC)
          if (slotStartUtc < rangeStartUtc || slotEndUtc > rangeEndUtc) continue;

          // Overlap check against scheduled sessions (UTC)
          const startMs = slotStartUtc.getTime();
          const endMs = slotEndUtc.getTime();
          if (overlapsAny(startMs, endMs)) continue;

          const startIso = slotStartUtc.toISOString();
          const endIso = slotEndUtc.toISOString();

          const group =
            slotMap.get(startIso) ?? { start: startIso, options: [] as SlotOption[] };

          if (!group.options.some((o) => o.durationMinutes === dur)) {
            group.options.push({ durationMinutes: dur, end: endIso });
          }
          slotMap.set(startIso, group);
        }
      }
    }

    cursor = addDays(cursor, 1);
  }


  // Finalize ordering
  const result = Array.from(slotMap.values())
    .map((g) => ({
      ...g,
      options: g.options.sort((a, b) => a.durationMinutes - b.durationMinutes),
    }))
    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());

  // Debug logging
  // console.log("[availability] result", { slots: result.length });

  // if (result.length) {
  //   console.log("[availability] sample slot", {
  //     start: result[0].start,
  //     startLocal: formatInTimeZone(new Date(result[0].start), TZ, "yyyy-MM-dd HH:mm:ss XXX"),
  //   });
  // }

  return NextResponse.json({
    ok: true,
    timezoneDisplay: TZ, // tell UI what to display in
    slots: result,
  });
}
