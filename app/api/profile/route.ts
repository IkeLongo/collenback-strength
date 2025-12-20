import { NextResponse } from "next/server";
import type { RowDataPacket, ResultSetHeader } from "mysql2/promise";
import { pool } from "@/app/lib/mysql";

// Adjust this import if needed:
import { auth } from "@/app/actions/nextauth";

function avatarUrlFromKey(key: string | null) {
  const base = process.env.R2_PUBLIC_BASE_URL;
  if (!key || !base) return null;
  return `${base.replace(/\/$/, "")}/${key}`;
}

export async function GET() {
  const session = await auth();
  const userId = session?.user?.id;

  console.log("[GET /api/profile] session userId:", userId);

  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT id, email, first_name, last_name, phone, avatar_key
     FROM users
     WHERE id = ? LIMIT 1`,
    [userId]
  );

  const u = rows[0] as any | undefined;

  console.log("[GET /api/profile] db user found:", !!u);

  if (!u) return NextResponse.json({ message: "Not found" }, { status: 404 });

  const avatarUrl = avatarUrlFromKey(u.avatar_key ?? null);

  return NextResponse.json({
    user: {
      id: u.id,
      email: u.email,
      firstName: u.first_name,
      lastName: u.last_name,
      phone: u.phone,
      avatarKey: u.avatar_key,
      avatarUrl,
    },
  });
}

export async function PATCH(req: Request) {
  const session = await auth();
  const userId = session?.user?.id;

  console.log("[PATCH /api/profile] session userId:", userId);

  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json()) as {
    firstName?: string;
    lastName?: string;
    phone?: string;
  };

  const firstName = (body.firstName ?? "").trim();
  const lastName = (body.lastName ?? "").trim();
  const phone = (body.phone ?? "").trim();

  console.log("[PATCH /api/profile] incoming:", { firstName, lastName, phone });

  if (!firstName || !lastName) {
    return NextResponse.json({ message: "First and last name are required." }, { status: 400 });
  }

  const [res] = await pool.execute<ResultSetHeader>(
    `UPDATE users
     SET first_name = ?, last_name = ?, phone = ?, updated_at = NOW()
     WHERE id = ?`,
    [firstName, lastName, phone || null, userId]
  );

  console.log("[PATCH /api/profile] affectedRows:", res.affectedRows);

  return NextResponse.json({ ok: true });
}
