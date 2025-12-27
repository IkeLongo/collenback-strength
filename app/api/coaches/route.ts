import { NextResponse } from "next/server";
import { pool } from "@/app/lib/mysql";
import type { RowDataPacket } from "mysql2/promise";

export async function GET() {
  const [rows] = await pool.execute<RowDataPacket[]>(
    `
    SELECT u.id, u.first_name, u.last_name, u.email
    FROM users u
    JOIN user_roles ur ON ur.user_id = u.id
    JOIN roles r ON r.id = ur.role_id
    WHERE r.name = 'coach'
      AND u.is_active = 1
    ORDER BY u.first_name, u.last_name
    `
  );

  const coaches = rows.map((r) => ({
    id: Number(r.id),
    name:
      [r.first_name, r.last_name].filter(Boolean).join(" ") ||
      String(r.email),
  }));

  return NextResponse.json({ ok: true, coaches });
}
