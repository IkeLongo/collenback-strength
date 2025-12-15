import { NextResponse } from "next/server";
import { auth } from "@/app/actions/nextauth";
import { pool } from "@/app/lib/mysql";
import type { RowDataPacket } from "mysql2/promise";
import { client } from "@/sanity/lib/client";

const QUERY = /* groq */ `
  *[_id in $ids]{
    _id,
    title,
    "slug": slug.current
  }
`;

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const userId = Number(session.user.id);

  try {
    // 1) Get distinct service ids/slugs the user has credits for
    const [rows] = await pool.execute<RowDataPacket[]>(
      `
      SELECT DISTINCT sanity_service_id, sanity_service_slug
      FROM session_credits
      WHERE user_id = ?
        AND (expires_at IS NULL OR expires_at > NOW())
        AND (total_credits - credits_used - credits_reserved) > 0
        AND (sanity_service_id IS NOT NULL OR sanity_service_slug IS NOT NULL)
      `,
      [userId]
    );

    const ids = rows
      .map((r) => r.sanity_service_id)
      .filter(Boolean) as string[];

    // If you only store slug but not id, we can also query by slug — but IDs are best.
    if (ids.length === 0) {
      return NextResponse.json({ ok: true, services: [] });
    }

    // 2) Fetch details from Sanity by ids
    const sanityRows = await client.fetch(QUERY, { ids });

    const services = (sanityRows ?? []).map((s: any) => ({
      id: s._id as string,
      title: (s.title ?? "Service") as string,
      slug: (s.slug ?? "") as string,
    }));

    return NextResponse.json({ ok: true, services });
  } catch (e: any) {
    console.error("[services] error", e);
    return NextResponse.json(
      { ok: false, error: "server_error", detail: e?.message },
      { status: 500 }
    );
  }
}
