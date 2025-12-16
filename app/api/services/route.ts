import { NextResponse } from "next/server";
import { auth } from "@/app/actions/nextauth";
import { pool } from "@/app/lib/mysql";
import type { RowDataPacket } from "mysql2/promise";
import { client } from "@/sanity/lib/client";

const QUERY = /* groq */ `
  *[_id in $ids]{
    _id,
    title,
    "slug": slug.current,
    category
  }
`;

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const userId = Number(session.user.id);
  if (!Number.isFinite(userId)) {
    return NextResponse.json({ ok: false, error: "invalid_user" }, { status: 400 });
  }

  try {
    // 1) PACK services (only if user has AVAILABLE credits)
    const [packRows] = await pool.execute<RowDataPacket[]>(
      `
      SELECT DISTINCT sc.sanity_service_id
      FROM session_credits sc
      WHERE sc.user_id = ?
        AND sc.status = 'active'
        AND (sc.expires_at IS NULL OR sc.expires_at > NOW())
        AND (sc.total_credits - sc.credits_used - sc.credits_reserved) > 0
        AND sc.sanity_service_id IS NOT NULL
      `,
      [userId]
    );

    // 2) MEMBERSHIP services (active/trialing subscription still in period)
    const [subRows] = await pool.execute<RowDataPacket[]>(
      `
      SELECT DISTINCT s.sanity_service_id
      FROM subscriptions s
      WHERE s.user_id = ?
        AND s.sanity_service_id IS NOT NULL
        AND s.status IN ('active','trialing')
        AND (s.current_period_end IS NULL OR s.current_period_end > NOW())
      `,
      [userId]
    );

    // 3) Merge IDs -> unique
    const ids = Array.from(
      new Set([
        ...packRows.map((r) => r.sanity_service_id).filter(Boolean),
        ...subRows.map((r) => r.sanity_service_id).filter(Boolean),
      ])
    ) as string[];

    if (ids.length === 0) {
      return NextResponse.json({ ok: true, services: [] });
    }

    // 4) Fetch details from Sanity
    const sanityRows = await client.fetch(QUERY, { ids });

    const services = (sanityRows ?? []).map((s: any) => ({
      id: s._id as string,
      title: (s.title ?? "Service") as string,
      slug: (s.slug ?? "") as string,
      category: (s.category ?? null) as string | null,
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

