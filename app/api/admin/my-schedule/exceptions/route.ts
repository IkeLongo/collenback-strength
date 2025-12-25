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

  const date = String(body.date ?? "");
  const type = (body.type ?? "blocked") as "blocked" | "custom";
  const note = body.note ?? null;

  if (!date) return bad("date is required (YYYY-MM-DD).");
  if (type !== "blocked" && type !== "custom") return bad("type must be blocked or custom.");

  const start_time = body.start_time ? String(body.start_time) : null;
  const end_time = body.end_time ? String(body.end_time) : null;

  if (type === "custom") {
    if (!start_time || !end_time) return bad("custom exceptions require start_time and end_time.");
    if (start_time >= end_time) return bad("start_time must be before end_time.");
  }

  const [result] = await pool.execute(
    `
    INSERT INTO availability_exceptions (coach_id, date, start_time, end_time, type, note)
    VALUES (?, ?, ?, ?, ?, ?)
    `,
    [coachId, date, start_time, end_time, type, note]
  );

  return NextResponse.json({ ok: true, id: (result as any).insertId });
}

export async function DELETE(req: Request) {
  const guard = await requireAdmin();
  if (!guard.ok) return bad(guard.message ?? "Unauthorized", guard.status ?? 401);

  const body = await req.json().catch(() => null);
  const id = Number(body?.id);
  if (!id) return bad("id is required.");

  await pool.execute(
    `DELETE FROM availability_exceptions WHERE id = ? AND coach_id = ?`,
    [id, guard.userId]
  );

  return NextResponse.json({ ok: true });
}