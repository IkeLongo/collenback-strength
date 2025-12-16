import { pool } from "@/app/lib/mysql";
import type { RowDataPacket } from "mysql2/promise";

export type ClientPackSummary = {
  sanity_service_id: string | null;
  sanity_service_slug: string | null;
  service_title: string | null;
  service_category: string | null;

  purchases_count: number; // number of packs bought (rows)
  total_credits: number;
  credits_used: number;
  credits_reserved: number;
  available_credits: number;

  last_purchase_at: Date | null;
};

export type ClientMembershipSummary = {
  sanity_service_id: string | null;
  sanity_service_slug: string | null;
  service_title: string | null;
  service_category: string | null;

  status: "active" | "trialing";
  current_period_end: Date;
};

export type ClientDashboardData = {
  packs_active: ClientPackSummary[];
  packs_history: ClientPackSummary[];
  memberships_active: ClientMembershipSummary[];

  totals: {
    available_credits: number;
    reserved_credits: number;
    used_credits: number;
    total_credits: number;
    active_memberships: number;
  };
};

function toDate(v: any): Date | null {
  return v ? new Date(v) : null;
}

export async function getClientDashboardData(userId: number): Promise<ClientDashboardData> {
  const conn = await pool.getConnection();
  try {
    // ACTIVE PACKS (only active + not expired + has any credits left or reserved)
    const [packsActiveRows] = await conn.query<RowDataPacket[]>(
      `
      SELECT
        sc.sanity_service_id,
        sc.sanity_service_slug,
        MAX(pi.service_title) AS service_title,
        MAX(pi.service_category) AS service_category,

        COUNT(*) AS purchases_count,
        SUM(sc.total_credits) AS total_credits,
        SUM(sc.credits_used) AS credits_used,
        SUM(sc.credits_reserved) AS credits_reserved,
        SUM(sc.total_credits - sc.credits_used - sc.credits_reserved) AS available_credits,

        MAX(sc.created_at) AS last_purchase_at
      FROM session_credits sc
      LEFT JOIN payment_items pi ON pi.id = sc.payment_item_id
      WHERE sc.user_id = ?
        AND sc.status = 'active'
        AND (sc.expires_at IS NULL OR sc.expires_at > NOW())
      GROUP BY sc.sanity_service_id, sc.sanity_service_slug
      HAVING (SUM(sc.total_credits - sc.credits_used - sc.credits_reserved) > 0 OR SUM(sc.credits_reserved) > 0)
      ORDER BY MAX(sc.created_at) DESC
      `,
      [userId]
    );

    const packs_active: ClientPackSummary[] = packsActiveRows.map((r) => ({
      sanity_service_id: (r as any).sanity_service_id ?? null,
      sanity_service_slug: (r as any).sanity_service_slug ?? null,
      service_title: (r as any).service_title ?? null,
      service_category: (r as any).service_category ?? null,

      purchases_count: Number((r as any).purchases_count ?? 0),
      total_credits: Number((r as any).total_credits ?? 0),
      credits_used: Number((r as any).credits_used ?? 0),
      credits_reserved: Number((r as any).credits_reserved ?? 0),
      available_credits: Math.max(0, Number((r as any).available_credits ?? 0)),

      last_purchase_at: toDate((r as any).last_purchase_at),
    }));

    // PACK HISTORY (expired OR not active OR fully used w/ no reserved)
    const [packsHistoryRows] = await conn.query<RowDataPacket[]>(
      `
      SELECT
        sc.sanity_service_id,
        sc.sanity_service_slug,
        MAX(pi.service_title) AS service_title,
        MAX(pi.service_category) AS service_category,

        COUNT(*) AS purchases_count,
        SUM(sc.total_credits) AS total_credits,
        SUM(sc.credits_used) AS credits_used,
        SUM(sc.credits_reserved) AS credits_reserved,
        SUM(sc.total_credits - sc.credits_used - sc.credits_reserved) AS available_credits,

        MAX(sc.created_at) AS last_purchase_at
      FROM session_credits sc
      LEFT JOIN payment_items pi ON pi.id = sc.payment_item_id
      WHERE sc.user_id = ?
        AND (
          sc.status <> 'active'
          OR (sc.expires_at IS NOT NULL AND sc.expires_at <= NOW())
        )
      GROUP BY sc.sanity_service_id, sc.sanity_service_slug
      ORDER BY MAX(sc.created_at) DESC
      `,
      [userId]
    );

    const packs_history: ClientPackSummary[] = packsHistoryRows.map((r) => ({
      sanity_service_id: (r as any).sanity_service_id ?? null,
      sanity_service_slug: (r as any).sanity_service_slug ?? null,
      service_title: (r as any).service_title ?? null,
      service_category: (r as any).service_category ?? null,

      purchases_count: Number((r as any).purchases_count ?? 0),
      total_credits: Number((r as any).total_credits ?? 0),
      credits_used: Number((r as any).credits_used ?? 0),
      credits_reserved: Number((r as any).credits_reserved ?? 0),
      available_credits: Math.max(0, Number((r as any).available_credits ?? 0)),

      last_purchase_at: toDate((r as any).last_purchase_at),
    }));

    // ACTIVE MEMBERSHIPS
    const [subsRows] = await conn.query<RowDataPacket[]>(
      `
      SELECT
        s.sanity_service_id,
        s.sanity_service_slug,
        MAX(pi.service_title) AS service_title,
        MAX(pi.service_category) AS service_category,
        s.status,
        s.current_period_end
      FROM subscriptions s
      LEFT JOIN payment_items pi ON pi.sanity_service_id = s.sanity_service_id
      WHERE s.user_id = ?
        AND (s.status = 'active' OR s.status = 'trialing')
        AND s.current_period_end > NOW()
      GROUP BY s.sanity_service_id, s.sanity_service_slug, s.status, s.current_period_end
      ORDER BY s.current_period_end ASC
      `,
      [userId]
    );

    const memberships_active: ClientMembershipSummary[] = subsRows.map((s) => ({
      sanity_service_id: (s as any).sanity_service_id ?? null,
      sanity_service_slug: (s as any).sanity_service_slug ?? null,
      service_title: (s as any).service_title ?? null,
      service_category: (s as any).service_category ?? null,
      status: ((s as any).status ?? "active") as any,
      current_period_end: new Date((s as any).current_period_end),
    }));

    // Totals (derived from active packs)
    const totals = packs_active.reduce(
      (acc, p) => {
        acc.available_credits += p.available_credits;
        acc.reserved_credits += p.credits_reserved;
        acc.used_credits += p.credits_used;
        acc.total_credits += p.total_credits;
        return acc;
      },
      {
        available_credits: 0,
        reserved_credits: 0,
        used_credits: 0,
        total_credits: 0,
        active_memberships: memberships_active.length,
      }
    );

    return { packs_active, packs_history, memberships_active, totals };
  } finally {
    conn.release();
  }
}
