import { NextResponse } from "next/server";
import { requireAdmin } from "@/app/lib/auth/requireAdmin";
import { pool } from "@/app/lib/mysql";

function bad(message: string, status = 400) {
  return NextResponse.json({ ok: false, message }, { status });
}

export async function POST(req: Request) {
  const guard = await requireAdmin();
  if (!guard.ok) return bad(guard.message ?? "Unauthorized", guard.status ?? 401);

  const body = await req.json().catch(() => null);
  if (!body) return bad("Invalid JSON body.");

  const coachId = guard.userId;

  const day_of_week = Number(body.day_of_week);
  const start_time = String(body.start_time ?? "");
  const end_time = String(body.end_time ?? "");
  const timezone = String(body.timezone ?? "America/Chicago");

  if (!(day_of_week >= 0 && day_of_week <= 6)) return bad("day_of_week must be 0-6.");
  if (!start_time || !end_time) return bad("start_time and end_time are required.");
  if (start_time >= end_time) return bad("start_time must be before end_time.");

  const [result] = await pool.execute(
    `
    INSERT INTO availability_rules (coach_id, day_of_week, start_time, end_time, timezone, is_active)
    VALUES (?, ?, ?, ?, ?, 1)
    `,
    [coachId, day_of_week, start_time, end_time, timezone]
  );

  return NextResponse.json({ ok: true, id: (result as any).insertId });
}

export async function DELETE(req: Request) {
  const guard = await requireAdmin();
  if (!guard.ok) return bad(guard.message ?? "Unauthorized", guard.status ?? 401);

  const body = await req.json().catch(() => null);
  const id = Number(body?.id);
  if (!id) return bad("id is required.");

  // only delete rows owned by the current admin/coach
  await pool.execute(
    `DELETE FROM availability_rules WHERE id = ? AND coach_id = ?`,
    [id, guard.userId]
  );

  return NextResponse.json({ ok: true });
}