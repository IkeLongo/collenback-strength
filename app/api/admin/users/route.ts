import { NextResponse } from "next/server";
import { pool } from "@/app/lib/mysql";
import type { RowDataPacket } from "mysql2/promise";
import { auth } from "@/app/actions/nextauth";

type RoleName = "client" | "coach" | "admin";

function clampInt(v: string | null, def: number, min: number, max: number) {
  const n = Number(v);
  if (!Number.isFinite(n)) return def;
  return Math.max(min, Math.min(max, Math.floor(n)));
}

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }

  // Basic admin check (matches your earlier pattern)
  const u: any = session.user;
  const role = u?.role;
  const roleIds: number[] = u?.roleIds ?? [];
  const isAdmin = u?.isAdmin === true || role === "admin" || roleIds.includes(3);
  if (!isAdmin) {
    return NextResponse.json({ ok: false, message: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);

  const roleFilter = (searchParams.get("role") || "client") as RoleName;
  const q = (searchParams.get("search") || "").trim();
  const limit = clampInt(searchParams.get("limit"), 10, 1, 100);
  const offset = clampInt(searchParams.get("offset"), 0, 0, 1_000_000);

  if (!["client", "coach", "admin"].includes(roleFilter)) {
    return NextResponse.json({ ok: false, message: "Invalid role" }, { status: 400 });
  }

  const like = q ? `%${q}%` : null;

  // Filter users by having the selected role, but still return ALL roles they have.
  const where = `
    WHERE EXISTS (
      SELECT 1
      FROM user_roles ur2
      JOIN roles r2 ON r2.id = ur2.role_id
      WHERE ur2.user_id = u.id AND r2.name = ?
    )
    ${q ? `AND (
      u.email LIKE ? OR
      u.first_name LIKE ? OR
      u.last_name LIKE ? OR
      u.phone LIKE ?
    )` : ""}
  `;

  const params: any[] = [roleFilter];
  if (q) params.push(like, like, like, like);

  try {
    // Total distinct users (for pagination)
    const countSql = `
      SELECT COUNT(*) as total
      FROM users u
      ${where}
    `;
    const [countRows] = await pool.query<RowDataPacket[]>(countSql, params);
    const total = Number(countRows?.[0]?.total ?? 0);

    // List
    const listSql = `
      SELECT
        u.id,
        u.email,
        u.first_name,
        u.last_name,
        u.phone,
        u.is_active,
        u.created_at,
        u.avatar_key,
        GROUP_CONCAT(DISTINCT r.name ORDER BY r.name SEPARATOR ',') AS roles_csv
      FROM users u
      LEFT JOIN user_roles ur ON ur.user_id = u.id
      LEFT JOIN roles r ON r.id = ur.role_id
      ${where}
      GROUP BY u.id
      ORDER BY u.created_at DESC
      LIMIT ? OFFSET ?;
    `;

    const [rows] = await pool.query<RowDataPacket[]>(listSql, [...params, limit, offset]);

    const users = (rows ?? []).map((r: any) => ({
      id: r.id,
      email: r.email,
      first_name: r.first_name,
      last_name: r.last_name,
      phone: r.phone,
      is_active: !!r.is_active,
      created_at: r.created_at,
      avatar_key: r.avatar_key ?? null,
      roles: String(r.roles_csv ?? "")
        .split(",")
        .map((x) => x.trim())
        .filter(Boolean),
    }));

    return NextResponse.json({
      ok: true,
      role: roleFilter,
      search: q,
      total,
      limit,
      offset,
      users,
    });
  } catch (e) {
    console.error("GET /api/admin/users error:", e);
    return NextResponse.json({ ok: false, message: "Failed to load users." }, { status: 500 });
  }
}
