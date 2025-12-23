import { NextResponse } from "next/server";
import { pool } from "@/app/lib/mysql";
import type { RowDataPacket } from "mysql2/promise";
import { auth } from "@/app/actions/nextauth";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);

  const limit = Math.min(Number(searchParams.get("limit") ?? "25"), 100);
  const offset = Math.max(Number(searchParams.get("offset") ?? "0"), 0);

  const status = searchParams.get("status"); // optional: pending|succeeded|failed|refunded
  const q = (searchParams.get("q") ?? "").trim(); // optional search (email/name)

  // WHERE
  const where: string[] = [];
  const params: any[] = [];

  if (status) {
    where.push("p.status = ?");
    params.push(status);
  }

  if (q) {
    where.push("(u.email LIKE ? OR u.first_name LIKE ? OR u.last_name LIKE ?)");
    const like = `%${q}%`;
    params.push(like, like, like);
  }

  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

  try {
    // total count
    const [countRows] = await pool.query<RowDataPacket[]>(
      `
      SELECT COUNT(*) as total
      FROM payments p
      JOIN users u ON u.id = p.user_id
      ${whereSql}
      `,
      params
    );

    const total = Number(countRows?.[0]?.total ?? 0);

    // main page rows
    const [rows] = await pool.query<RowDataPacket[]>(
      `
      SELECT
        p.id,
        p.user_id,
        p.amount_cents,
        p.currency,
        p.provider,
        p.provider_session_id,
        p.provider_payment_id,
        p.status,
        p.paid_at,
        p.created_at,
        p.subscription_id,
        p.notes,

        u.email as user_email,
        u.first_name as user_first_name,
        u.last_name as user_last_name,
        u.avatar_key as user_avatar_key,

        s.status as subscription_status,
        s.current_period_end as subscription_current_period_end

      FROM payments p
      JOIN users u ON u.id = p.user_id
      LEFT JOIN subscriptions s ON s.id = p.subscription_id
      ${whereSql}
      ORDER BY COALESCE(p.paid_at, p.created_at) DESC
      LIMIT ? OFFSET ?
      `,
      [...params, limit, offset]
    );

    // summary cards
    const [revRows] = await pool.query<RowDataPacket[]>(
      `
      SELECT
        COALESCE(SUM(CASE WHEN status='succeeded' THEN amount_cents ELSE 0 END), 0) as revenue_30d_cents,
        COALESCE(SUM(CASE WHEN status='succeeded' THEN 1 ELSE 0 END), 0) as count_30d,
        COALESCE(SUM(CASE WHEN status='refunded' THEN 1 ELSE 0 END), 0) as refunds_30d
      FROM payments
      WHERE created_at >= (NOW() - INTERVAL 30 DAY)
      `
    );

    const [subsRows] = await pool.query<RowDataPacket[]>(
      `
      SELECT
        COALESCE(SUM(CASE WHEN status IN ('trialing','active','past_due','paused') THEN 1 ELSE 0 END), 0) as active_subs
      FROM subscriptions
      `
    );

    const purchases = rows.map((r: any) => {
      const fullName = `${r.user_first_name ?? ""} ${r.user_last_name ?? ""}`.trim();
      return {
        id: r.id,
        user_id: r.user_id,

        user_name: fullName || r.user_email,
        user_email: r.user_email,
        user_avatar_key: r.user_avatar_key ?? null,

        amount_cents: r.amount_cents,
        currency: r.currency,
        provider: r.provider,
        provider_session_id: r.provider_session_id ?? null,
        provider_payment_id: r.provider_payment_id ?? null,
        status: r.status,
        paid_at: r.paid_at ?? null,
        created_at: r.created_at, // timestamp

        subscription_id: r.subscription_id ?? null,
        subscription_status: r.subscription_status ?? null,
        current_period_end: r.subscription_current_period_end ?? null,

        notes: r.notes ?? null,
      };
    });

    return NextResponse.json({
      ok: true,
      limit,
      offset,
      total,
      totals: {
        revenue_30d_cents: Number(revRows?.[0]?.revenue_30d_cents ?? 0),
        count_30d: Number(revRows?.[0]?.count_30d ?? 0),
        refunds_30d: Number(revRows?.[0]?.refunds_30d ?? 0),
        active_subs: Number(subsRows?.[0]?.active_subs ?? 0),
      },
      purchases,
    });
  } catch (e) {
    console.error("GET /api/admin/purchases error:", e);
    return NextResponse.json({ ok: false, message: "Failed to load purchases." }, { status: 500 });
  }
}
