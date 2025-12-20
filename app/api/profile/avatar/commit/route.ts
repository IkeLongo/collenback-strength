import { NextResponse } from "next/server";
import type { ResultSetHeader } from "mysql2/promise";
import { pool } from "@/app/lib/mysql";

// Adjust this import if needed:
import { auth } from "@/app/actions/nextauth";

function avatarUrlFromKey(key: string | null) {
  const base = process.env.R2_PUBLIC_BASE_URL;
  if (!key || !base) return null;
  return `${base.replace(/\/$/, "")}/${key}`;
}

export async function POST(req: Request) {
  const session = await auth();
  const userId = session?.user?.id;

  console.log("[POST /api/profile/avatar/commit] userId:", userId);

  if (!userId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const body = (await req.json()) as { key?: string };
  const key = (body.key ?? "").trim();

  console.log("[commit] received key:", key);

  // Basic ownership validation (prevents someone committing another user’s key)
  const expectedPrefix = `avatars/user_${userId}_`;
  if (!key.startsWith(expectedPrefix)) {
    return NextResponse.json({ message: "Invalid avatar key." }, { status: 400 });
  }

  const [res] = await pool.execute<ResultSetHeader>(
    `UPDATE users
     SET avatar_key = ?, avatar_updated_at = NOW(), updated_at = NOW()
     WHERE id = ?`,
    [key, userId]
  );

  console.log("[commit] affectedRows:", res.affectedRows);

  const avatarUrl = avatarUrlFromKey(key);

  return NextResponse.json({ ok: true, avatarUrl });
}
