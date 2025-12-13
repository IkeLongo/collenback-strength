import pool from "@/app/lib/mysql";

export type EntitlementRow = {
  sanity_service_id: string | null;
  sanity_service_slug: string | null;
  service_title: string | null;
  service_category: string | null;
  total_credits: number;
  credits_used: number;
  expires_at: Date | null;
};

export async function getClientEntitlements(userId: number): Promise<EntitlementRow[]> {
  const conn = await pool.getConnection();
  try {
    // 1. Fetch session credits entitlements
    const [rows] = await conn.query<any[]>(
      `
      SELECT
        sc.sanity_service_id,
        sc.sanity_service_slug,
        MAX(pi.service_title) AS service_title,
        MAX(pi.service_category) AS service_category,
        SUM(sc.total_credits) AS total_credits,
        SUM(sc.credits_used) AS credits_used,
        MAX(sc.expires_at) AS expires_at
      FROM session_credits sc
      LEFT JOIN payment_items pi ON pi.id = sc.payment_item_id
      WHERE sc.user_id = ?
      GROUP BY sc.sanity_service_id, sc.sanity_service_slug
      ORDER BY MAX(sc.created_at) DESC;
      `,
      [userId]
    );

    const sessionEntitlements: EntitlementRow[] = rows.map((r) => ({
      sanity_service_id: r.sanity_service_id ?? null,
      sanity_service_slug: r.sanity_service_slug ?? null,
      service_title: r.service_title ?? null,
      service_category: r.service_category ?? null,
      total_credits: Number(r.total_credits ?? 0),
      credits_used: Number(r.credits_used ?? 0),
      expires_at: r.expires_at ? new Date(r.expires_at) : null,
    }));

    // 2. Fetch active subscriptions (memberships)
    const [subs] = await conn.query<any[]>(
      `
      SELECT
        s.sanity_service_id,
        s.sanity_service_slug,
        MAX(pi.service_title) AS service_title,
        MAX(pi.service_category) AS service_category,
        s.current_period_end,
        s.status
      FROM subscriptions s
      LEFT JOIN payment_items pi ON pi.sanity_service_id = s.sanity_service_id
      WHERE s.user_id = ?
        AND (s.status = 'active' OR s.status = 'trialing')
        AND s.current_period_end > NOW()
      GROUP BY s.sanity_service_id, s.sanity_service_slug, s.current_period_end, s.status
      `,
      [userId]
    );

    const subscriptionEntitlements: EntitlementRow[] = subs.map((s) => ({
      sanity_service_id: s.sanity_service_id ?? null,
      sanity_service_slug: s.sanity_service_slug ?? null,
      service_title: s.service_title ?? null,
      service_category: s.service_category ?? null,
      total_credits: 1, // Memberships are treated as 1 active credit
      credits_used: 0,
      expires_at: s.current_period_end ? new Date(s.current_period_end) : null,
    }));

    // 3. Merge session credits and subscriptions
    return [...sessionEntitlements, ...subscriptionEntitlements];
  } finally {
    conn.release();
  }
}
