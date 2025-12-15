import { NextResponse } from "next/server";
import { pool } from "@/app/lib/mysql";
import type { RowDataPacket } from "mysql2/promise";
import { addDays, format } from "date-fns";
import { toZonedTime } from "date-fns-tz";

const TZ = "America/Chicago";

/**
 * Helpers
 */
function toYmd(d: Date) {
  return format(d, "yyyy-MM-dd");
}

function dayOfWeekLocal(d: Date) {
  // 0 = Sunday ... 6 = Saturday
  return d.getDay();
}

/**
 * GET /api/availability/month
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const coachId = Number(searchParams.get("coachId"));
  const startYmd = searchParams.get("start"); // YYYY-MM-DD
  const endYmd = searchParams.get("end");     // YYYY-MM-DD (exclusive)

  if (!coachId || !startYmd || !endYmd) {
    return NextResponse.json(
      { ok: false, error: "missing_params" },
      { status: 400 }
    );
  }

  // Convert to Chicago-local Date objects (midday anchor avoids DST edges)
  const rangeStart = toZonedTime(new Date(`${startYmd}T12:00:00`), TZ);
  const rangeEnd = toZonedTime(new Date(`${endYmd}T12:00:00`), TZ);

  /**
   * Load recurring availability rules
   */
  const [rules] = await pool.execute<RowDataPacket[]>(
    `
    SELECT day_of_week, start_time, end_time
    FROM availability_rules
    WHERE coach_id = ?
      AND is_active = 1
    `,
    [coachId]
  );

  /**
   * Load exceptions in range
   */
  const [exceptions] = await pool.execute<RowDataPacket[]>(
    `
    SELECT date, start_time, end_time, type
    FROM availability_exceptions
    WHERE coach_id = ?
      AND date BETWEEN DATE(?) AND DATE(?)
    `,
    [coachId, startYmd, endYmd]
  );

  // Index exceptions by date (YYYY-MM-DD)
  const exByDate = new Map<string, RowDataPacket[]>();
  for (const ex of exceptions) {
    const key = toYmd(new Date(ex.date));
    const arr = exByDate.get(key) ?? [];
    arr.push(ex);
    exByDate.set(key, arr);
  }

  /**
   * Walk each day and determine if ANY availability exists
   */
  const availableDays: string[] = [];

  let cursor = new Date(rangeStart);
  while (cursor < rangeEnd) {
    const ymd = toYmd(cursor);
    const dow = dayOfWeekLocal(cursor);

    const dayRules = rules.filter(r => Number(r.day_of_week) === dow);
    const dayEx = exByDate.get(ymd) ?? [];

    // 1) All-day block → unavailable
    const hasAllDayBlock = dayEx.some(
      e => e.type === "blocked" && !e.start_time && !e.end_time
    );
    if (hasAllDayBlock) {
      cursor = addDays(cursor, 1);
      continue;
    }

    // 2) Custom availability overrides → available
    const hasCustomWindow = dayEx.some(
      e => e.type === "custom" && e.start_time && e.end_time
    );
    if (hasCustomWindow) {
      availableDays.push(ymd);
      cursor = addDays(cursor, 1);
      continue;
    }

    // 3) Recurring rule exists → available
    if (dayRules.length > 0) {
      availableDays.push(ymd);
    }

    cursor = addDays(cursor, 1);
  }

  return NextResponse.json({
    ok: true,
    days: availableDays,
  });
}
