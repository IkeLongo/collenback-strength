// app/ui/admin/dashboard/dashboard-data.ts
import { pool } from "@/app/lib/mysql";
import type { RowDataPacket } from "mysql2/promise";
import { getServicesByIds } from "@/sanity/lib/queries/getServiceByIds";
import type {
  DashboardData,
  ActivityItem,
  SessionListItem,
  DashboardStats,
} from "./dashboard-types";

const DBG = process.env.NODE_ENV !== "production"; // flip to true if you want always on

function log(...args: any[]) {
  if (DBG) console.log(...args);
}
function warn(...args: any[]) {
  if (DBG) console.warn(...args);
}

// function toIso(dt: any) {
//   const d = dt instanceof Date ? dt : new Date(dt);
//   if (Number.isNaN(d.getTime())) {
//     // don’t crash activity sorting
//     warn("[dashboard-data] toIso: invalid date", dt);
//     return new Date(0).toISOString();
//   }
//   return d.toISOString();
// }

function monthKeyChicago(d = new Date()) {
  const y = d.getFullYear();
  const m = d.getMonth();
  const start = new Date(y, m, 1, 0, 0, 0);
  const end = new Date(y, m + 1, 1, 0, 0, 0);
  return { start, end };
}

function mysqlToIsoUtc(dt: any) {
  if (dt instanceof Date) return dt.toISOString();
  const s = String(dt);
  // treat as UTC "YYYY-MM-DDTHH:MM:SSZ"
  return new Date(s.replace(" ", "T") + "Z").toISOString();
}

export async function getAdminDashboardData(
  adminUserId: number
): Promise<DashboardData> {
  log("[dashboard-data] START", { adminUserId });

  // -------------------------
  // 1) Upcoming sessions
  // -------------------------
  const [sessionRows] = await pool.execute<RowDataPacket[]>(
    `
    SELECT
      s.id,
      s.client_id,
      s.coach_id,
      s.scheduled_start,
      s.scheduled_end,
      s.location,
      s.status,
      s.sanity_service_id,
      s.sanity_service_slug,
      u.first_name,
      u.last_name
    FROM sessions s
    LEFT JOIN users u ON u.id = s.client_id
    WHERE s.status = 'scheduled'
      AND s.scheduled_start >= UTC_TIMESTAMP()
    ORDER BY s.scheduled_start ASC
    LIMIT 10
    `
  );

  log("[dashboard-data] sessionRows", {
    count: sessionRows.length,
    sample: sessionRows.slice(0, 2).map((r) => ({
      id: r.id,
      status: r.status,
      scheduled_start: r.scheduled_start,
      sanity_service_id: r.sanity_service_id,
    })),
  });

  const upcomingSessionsBase: SessionListItem[] = sessionRows.map((r) => ({
    id: String(r.id),
    clientUserId: Number(r.client_id),
    coachId: Number(r.coach_id),
    scheduledStartUtc: mysqlToIsoUtc(r.scheduled_start),
    scheduledEndUtc: mysqlToIsoUtc(r.scheduled_end),
    location: r.location ? String(r.location) : null,

    sanityServiceId: r.sanity_service_id ? String(r.sanity_service_id) : null,
    sanityServiceSlug: r.sanity_service_slug ? String(r.sanity_service_slug) : null,
    serviceTitle: null,

    clientName: [r.first_name, r.last_name].filter(Boolean).join(" ") || null,
  }));

  // -------------------------
  // 2) Recent purchases
  // -------------------------
  const [purchaseRows] = await pool.execute<RowDataPacket[]>(
    `
    SELECT
      p.id              AS payment_id,
      p.user_id         AS user_id,
      p.status          AS payment_status,
      p.created_at      AS payment_created_at,
      p.amount_cents    AS amount_cents,
      p.currency        AS currency,

      pi.sanity_service_id   AS sanity_service_id,
      pi.sanity_service_slug AS sanity_service_slug,
      pi.quantity            AS quantity,
      pi.amount_cents        AS item_amount_cents
    FROM payments p
    JOIN payment_items pi ON pi.payment_id = p.id
    WHERE p.status = 'succeeded'
    ORDER BY p.created_at DESC
    LIMIT 12
    `
  );

  log("[dashboard-data] purchaseRows", {
    count: purchaseRows.length,
    sample: purchaseRows.slice(0, 3).map((r) => ({
      payment_id: r.payment_id,
      status: r.payment_status,
      created_at: r.payment_created_at,
      amount_cents: r.amount_cents,
      item_amount_cents: r.item_amount_cents,
      sanity_service_id: r.sanity_service_id,
      qty: r.quantity,
    })),
  });

  // If this prints count: 0, the issue is in SQL/data, not the UI.
  if (purchaseRows.length === 0) {
    warn("[dashboard-data] purchaseRows is EMPTY. Checking quick diagnostics…");

    // 2a) do we have ANY succeeded payments?
    const [pCount] = await pool.execute<RowDataPacket[]>(
      `SELECT COUNT(*) AS cnt FROM payments WHERE status='succeeded'`
    );
    warn("[dashboard-data] succeeded payments count", pCount?.[0]?.cnt);

    // 2b) do we have payment_items at all?
    const [piCount] = await pool.execute<RowDataPacket[]>(
      `SELECT COUNT(*) AS cnt FROM payment_items`
    );
    warn("[dashboard-data] payment_items count", piCount?.[0]?.cnt);

    // 2c) do we have payment_items whose payment exists (join sanity)?
    const [joinCount] = await pool.execute<RowDataPacket[]>(
      `
      SELECT COUNT(*) AS cnt
      FROM payments p
      JOIN payment_items pi ON pi.payment_id = p.id
      `
    );
    warn("[dashboard-data] payments JOIN payment_items count", joinCount?.[0]?.cnt);

    // 2d) latest 3 payment statuses (spot enum mismatch like 'Succeeded' vs 'succeeded')
    const [latest] = await pool.execute<RowDataPacket[]>(
      `
      SELECT id, status, created_at
      FROM payments
      ORDER BY created_at DESC
      LIMIT 5
      `
    );
    warn("[dashboard-data] latest payments", latest);
  }

  // -------------------------
  // 3) Recent session activity
  // -------------------------
  const [recentSessionRows] = await pool.execute<RowDataPacket[]>(
    `
    SELECT
      s.id,
      s.client_id,
      s.status,
      s.scheduled_start,
      s.scheduled_end,
      s.created_at,
      s.updated_at,
      s.sanity_service_id,
      s.sanity_service_slug,

      CASE
        WHEN s.status IN ('canceled','cancelled') THEN COALESCE(s.updated_at, s.created_at)
        WHEN s.status = 'scheduled' THEN s.created_at
        ELSE NULL
      END AS occurred_at
    FROM sessions s
    WHERE s.status IN ('scheduled','canceled','cancelled')
    ORDER BY occurred_at DESC
    LIMIT 12
    `
  );

  log("[dashboard-data] recentSessionRows", {
    count: recentSessionRows.length,
    sample: recentSessionRows.slice(0, 2).map((r) => ({
      id: r.id,
      status: r.status,
      occurred: r.updated_at || r.created_at || r.scheduled_start,
      sanity_service_id: r.sanity_service_id,
    })),
  });

  // -------------------------
  // 4) Stats
  // -------------------------
  const [upcomingCountRows] = await pool.execute<RowDataPacket[]>(
    `
    SELECT COUNT(*) AS cnt
    FROM sessions
    WHERE status = 'scheduled'
      AND scheduled_start >= UTC_TIMESTAMP()
    `
  );

  const [activeClientsRows] = await pool.execute<RowDataPacket[]>(
    `
    SELECT COUNT(DISTINCT client_id) AS cnt
    FROM sessions
    WHERE scheduled_start >= (UTC_TIMESTAMP() - INTERVAL 30 DAY)
      AND scheduled_start <  (UTC_TIMESTAMP() + INTERVAL 30 DAY)
    `
  );

  const { start: monthStart, end: monthEnd } = monthKeyChicago(new Date());
  const monthStartMysql = monthStart.toISOString().slice(0, 19).replace("T", " ");
  const monthEndMysql = monthEnd.toISOString().slice(0, 19).replace("T", " ");

  const [revRows] = await pool.execute<RowDataPacket[]>(
    `
    SELECT COALESCE(SUM(amount_cents), 0) AS cents
    FROM payments
    WHERE status = 'succeeded'
      AND created_at >= ?
      AND created_at <  ?
    `,
    [monthStartMysql, monthEndMysql]
  );

  const [booked30Rows] = await pool.execute<RowDataPacket[]>(
    `
    SELECT COUNT(*) AS cnt
    FROM sessions
    WHERE COALESCE(created_at, scheduled_start) >= (UTC_TIMESTAMP() - INTERVAL 30 DAY)
    `
  );

  const stats: DashboardStats = {
    upcomingSessionsCount: Number(upcomingCountRows?.[0]?.cnt ?? 0),
    activeClientsCount: Number(activeClientsRows?.[0]?.cnt ?? 0),
    revenueThisMonthCents: Number(revRows?.[0]?.cents ?? 0),
    sessionsBooked30dCount: Number(booked30Rows?.[0]?.cnt ?? 0),
  };

  log("[dashboard-data] stats", stats);

  // -------------------------
  // 5) Collect sanity IDs
  // -------------------------
  const serviceIds = new Set<string>();

  for (const s of upcomingSessionsBase) {
    if (s.sanityServiceId) serviceIds.add(s.sanityServiceId);
  }
  for (const r of recentSessionRows) {
    if (r.sanity_service_id) serviceIds.add(String(r.sanity_service_id));
  }
  for (const r of purchaseRows) {
    if (r.sanity_service_id) serviceIds.add(String(r.sanity_service_id));
  }

  log("[dashboard-data] serviceIds", {
    count: serviceIds.size,
    list: Array.from(serviceIds).slice(0, 10),
  });

  const sanityServices = await getServicesByIds(Array.from(serviceIds));
  log("[dashboard-data] sanityServices fetched", {
    count: sanityServices.length,
    sample: sanityServices.slice(0, 2).map((s) => ({ _id: s._id, title: s.title })),
  });

  const serviceById = new Map(
    sanityServices.map((s) => [
      s._id,
      { title: s.title, slug: (s as any).slug ?? null, category: (s as any).category ?? null },
    ])
  );

  // -------------------------
  // 6) Hydrate sessions
  // -------------------------
  const upcomingSessions: SessionListItem[] = upcomingSessionsBase.map((s) => {
    const meta = s.sanityServiceId ? serviceById.get(s.sanityServiceId) : null;
    return {
      ...s,
      serviceTitle: meta?.title ?? null,
      sanityServiceSlug: s.sanityServiceSlug ?? meta?.slug ?? null,
    };
  });

  // -------------------------
  // 7) Build recentActivity
  // -------------------------
  const recentActivity: ActivityItem[] = [];

  // Session activity
  for (const r of recentSessionRows) {
    const sanityId = r.sanity_service_id ? String(r.sanity_service_id) : null;
    const meta = sanityId ? serviceById.get(sanityId) : null;

    const status = String(r.status);
    const kind =
      status === "canceled" || status === "cancelled"
        ? "session_canceled"
        : "session_booked";
    const occurredAt = (r as any).occurred_at || r.updated_at || r.created_at || r.scheduled_start;

    recentActivity.push({
      id: `session_${r.id}`,
      kind,
      title: kind === "session_canceled" ? "Session canceled" : "Session booked",
      description: meta?.title ? meta.title : sanityId ? `Service: ${sanityId}` : undefined,
      occurredAtUtc: mysqlToIsoUtc(occurredAt),
      href: "/admin/sessions",
    });
  }

  // Purchase activity
  let pushedPurchases = 0;

  for (const r of purchaseRows) {
    const sanityId = r.sanity_service_id ? String(r.sanity_service_id) : null;
    const meta = sanityId ? serviceById.get(sanityId) : null;

    const qty = Number(r.quantity ?? 1);
    const cents = Number(r.amount_cents ?? 0);
    const currency = (r.currency ?? "USD").toString().toUpperCase();

    const dollars = (cents / 100).toLocaleString(undefined, {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    });

    const occurredAtUtc = mysqlToIsoUtc(r.payment_created_at);

    // log each row (only first few)
    if (pushedPurchases < 3) {
      log("[dashboard-data] purchase row -> activity", {
        payment_id: r.payment_id,
        sanityId,
        titleFromSanity: meta?.title ?? null,
        created_at: r.payment_created_at,
        occurredAtUtc,
        cents,
        currency,
        qty,
      });
    }

    recentActivity.push({
      id: `payment_${r.payment_id}_${sanityId ?? "unknown"}`,
      kind: "purchase_completed",
      title: `Purchase completed • ${dollars}`,
      description: meta?.title
        ? `${meta.title}${qty > 1 ? ` (x${qty})` : ""}`
        : sanityId
          ? `Service: ${sanityId}${qty > 1 ? ` (x${qty})` : ""}`
          : undefined,
      occurredAtUtc,
      href: "/admin/purchases",
    });

    pushedPurchases += 1;
  }

  log("[dashboard-data] recentActivity counts (pre-sort)", {
    total: recentActivity.length,
    sessionItems: recentActivity.filter((x) => x.kind !== "purchase_completed").length,
    purchaseItems: recentActivity.filter((x) => x.kind === "purchase_completed").length,
  });

  // Sort desc
  recentActivity.sort(
    (a, b) => new Date(b.occurredAtUtc).getTime() - new Date(a.occurredAtUtc).getTime()
  );

  const sliced = recentActivity.slice(0, 12);

  log("[dashboard-data] recentActivity counts (post-sort/slice)", {
    total: sliced.length,
    purchaseItems: sliced.filter((x) => x.kind === "purchase_completed").length,
    sample: sliced.slice(0, 5).map((x) => ({
      kind: x.kind,
      title: x.title,
      occurredAtUtc: x.occurredAtUtc,
    })),
  });

  return {
    stats,
    upcomingSessions,
    recentActivity: sliced,
  };
}
