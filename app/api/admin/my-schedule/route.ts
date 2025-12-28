import { NextResponse } from "next/server";
import { requireAdmin } from "@/app/lib/auth/requireAdmin";
import { pool } from "@/app/lib/mysql";
import type { RowDataPacket } from "mysql2/promise";

export async function GET() {
  const guard = await requireAdmin();
  if (!guard.ok) {
    return NextResponse.json(
      { ok: false, message: guard.message ?? "Unauthorized" },
      { status: guard.status ?? 401 }
    );
  }

  const coachId = guard.userId;

  const [rules] = await pool.execute<RowDataPacket[]>(
    `
    SELECT id, coach_id, day_of_week, start_time, end_time, timezone, is_active
    FROM availability_rules
    WHERE coach_id = ? AND is_active = 1
    ORDER BY day_of_week ASC, start_time ASC
    `,
    [coachId]
  );

  const [exceptions] = await pool.execute<RowDataPacket[]>(
    `
    SELECT id, coach_id, date, start_time, end_time, type, note
    FROM availability_exceptions
    WHERE coach_id = ?
    ORDER BY date DESC, start_time ASC
    `,
    [coachId]
  );

  return NextResponse.json({
    ok: true,
    rules,
    exceptions,
  });
}