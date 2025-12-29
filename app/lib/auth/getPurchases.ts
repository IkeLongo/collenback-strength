// app/lib/admin/getPurchases.ts
"use server";

import { pool } from "@/app/lib/mysql";
import type { RowDataPacket } from "mysql2/promise";
import { requireAdmin } from "@/app/lib/auth/requireAdmin";

export type PurchasesQuery = {
  limit?: number;
  offset?: number;
  status?: string | null; // pending|succeeded|failed|refunded
  q?: string | null;      // email/name search
};

export async function getAdminPurchases(input: PurchasesQuery) {
  const guard = await requireAdmin();
  if (!guard.ok) {
    return {
      ok: false as const,
      status: guard.status,
      message: guard.message,
    };
  }

  const limit = Math.min(Number(input.limit ?? 25), 100);
  const offset = Math.max(Number(input.offset ?? 0), 0);

  const status = (input.status ?? "").trim() || null;
  const q = (input.q ?? "").trim();

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

    const total = Number((countRows as any)?.[0]?.total ?? 0);

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

    const purchases = (rows as any[]).map((r) => {
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
        created_at: r.created_at,

        subscription_id: r.subscription_id ?? null,
        subscription_status: r.subscription_status ?? null,
        current_period_end: r.subscription_current_period_end ?? null,

        notes: r.notes ?? null,
      };
    });

    return {
      ok: true as const,
      limit,
      offset,
      total,
      totals: {
        revenue_30d_cents: Number((revRows as any)?.[0]?.revenue_30d_cents ?? 0),
        count_30d: Number((revRows as any)?.[0]?.count_30d ?? 0),
        refunds_30d: Number((revRows as any)?.[0]?.refunds_30d ?? 0),
        active_subs: Number((subsRows as any)?.[0]?.active_subs ?? 0),
      },
      purchases,
    };
  } catch (e) {
    return { ok: false as const, status: 500, message: "Failed to load purchases." };
  }
}
