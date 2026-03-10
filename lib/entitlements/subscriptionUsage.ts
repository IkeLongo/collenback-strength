// app/lib/entitlements/subscriptionUsage.ts
import type { RowDataPacket } from "mysql2/promise";
import type { Connection } from "mysql2/promise";

export type SubscriptionWindow = {
  subscription_id: number;
  period_start: Date;
  period_end: Date;
};

export async function getSubscriptionUsedCountsForWindows(opts: {
  conn: Connection;
  userId: number;
  windows: SubscriptionWindow[];
}) {
  const { conn, userId, windows } = opts;

  const usage = new Map<number, number>();
  if (!windows.length) return usage;

  const windowSql = windows
    .map(() => "SELECT ? AS subscription_id, ? AS period_start, ? AS period_end")
    .join(" UNION ALL ");

  const params: any[] = [];
  for (const w of windows) params.push(w.subscription_id, w.period_start, w.period_end);

  const [rows] = await conn.query<RowDataPacket[]>(
    `
    SELECT
      x.subscription_id,
      COUNT(sess.id) AS used_count
    FROM (
      ${windowSql}
    ) x
    LEFT JOIN sessions sess
      ON sess.subscription_id = x.subscription_id
     AND sess.client_id = ?
     AND sess.charged = 1
     AND sess.status IN ('scheduled','completed','cancelled','no_show')
     AND sess.scheduled_start >= x.period_start
     AND sess.scheduled_start < x.period_end
    GROUP BY x.subscription_id
    `,
    [...params, userId]
  );

  for (const r of rows as any[]) {
    usage.set(Number(r.subscription_id), Number(r.used_count ?? 0));
  }

  // default 0 for any missing
  for (const w of windows) if (!usage.has(w.subscription_id)) usage.set(w.subscription_id, 0);

  return usage;
}
