import { NextResponse } from "next/server";
import { auth } from "@/app/actions/nextauth";
import { pool } from "@/app/lib/mysql";
import type { RowDataPacket } from "mysql2/promise";
import { client as sanityClient } from "@/sanity/lib/client";

const SERVICE_QUERY = /* groq */ `
  *[_id in $ids]{
    _id,
    title
  }
`;

type Bucket = "upcoming" | "past" | "all";

/**
 * Treat MySQL DATETIME as UTC (common pattern: UTC stored without timezone).
 * Convert to a real UTC ISO string so clients can render correctly in America/Chicago.
 */
function mysqlDatetimeToUtcIso(dt: any) {
  // mysql2 might give a Date, or a "YYYY-MM-DD HH:mm:ss" string
  if (typeof dt === "string") {
    // "2025-12-17 15:00:00" -> "2025-12-17T15:00:00Z"
    return dt.replace(" ", "T") + "Z";
  }
  // If it's already a Date, keep it as ISO (which is UTC)
  return new Date(dt).toISOString();
}

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const userId = Number(session.user.id);
  if (!Number.isFinite(userId)) {
    return NextResponse.json({ ok: false, error: "invalid_user" }, { status: 400 });
  }

  const { searchParams } = new URL(req.url);

  const bucketRaw = (searchParams.get("bucket") ?? searchParams.get("range") ?? "upcoming").toLowerCase();
  const bucket: Bucket =
    bucketRaw === "past" || bucketRaw === "all" || bucketRaw === "upcoming" ? (bucketRaw as Bucket) : "upcoming";

  // Optional UTC ISO range. If provided, it narrows the query to that time window.
  const startParam = searchParams.get("start"); // ISO string (UTC)
  const endParam = searchParams.get("end");     // ISO string (UTC)

  const rawLimit = Number(searchParams.get("limit") ?? 50);
  const limit = Number.isFinite(rawLimit) ? Math.min(Math.max(rawLimit, 1), 200) : 50;

  let where = `s.client_id = ?`;
  const params: any[] = [userId];
  let order = `s.scheduled_start ASC`;

  if (startParam && endParam) {
    // validate ISO-ish values
    const startDate = new Date(startParam);
    const endDate = new Date(endParam);
    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
      return NextResponse.json({ ok: false, error: "invalid_range" }, { status: 400 });
    }
    if (startDate >= endDate) {
      return NextResponse.json({ ok: false, error: "invalid_range_order" }, { status: 400 });
    }

    where += ` AND s.scheduled_start >= ? AND s.scheduled_start < ?`;
    params.push(startParam, endParam);

    // If user asked for past within a month, enforce past-ness too
    if (bucket === "past") {
      where += ` AND s.scheduled_end < UTC_TIMESTAMP()`;
      order = `s.scheduled_start ASC`;
    } else {
      order = `s.scheduled_start ASC`;
    }
  } else {
    if (bucket === "upcoming") {
      where += ` AND s.scheduled_start >= UTC_TIMESTAMP()`;
      order = `s.scheduled_start ASC`;
    } else if (bucket === "past") {
      where += ` AND s.scheduled_end < UTC_TIMESTAMP()`;
      order = `s.scheduled_start ASC`;
    } else {
      order = `s.scheduled_start ASC`;
    }
  }

  try {
    const sql = `
      SELECT
        s.id,
        s.scheduled_start,
        s.scheduled_end,
        s.status,
        s.sanity_service_id,
        CONCAT(c.first_name, ' ', c.last_name) AS coach_name
      FROM sessions s
      LEFT JOIN users c ON c.id = s.coach_id
      WHERE ${where}
      ORDER BY ${order}
      LIMIT ${limit}
    `;

    const [rows] = await pool.execute<RowDataPacket[]>(sql, params);

    const serviceIds = Array.from(new Set(rows.map((r) => r.sanity_service_id).filter(Boolean))) as string[];

    const serviceMap = new Map<string, string>();
    if (serviceIds.length > 0) {
      const sanityRows = await sanityClient.fetch(SERVICE_QUERY, { ids: serviceIds });
      for (const s of sanityRows ?? []) serviceMap.set(s._id, s.title ?? "Service");
    }

    const sessions = rows.map((r) => ({
      id: String(r.id),
      start: mysqlDatetimeToUtcIso(r.scheduled_start), // ✅ UTC ISO w/ Z
      end: mysqlDatetimeToUtcIso(r.scheduled_end),     // ✅ UTC ISO w/ Z
      status: r.status,
      coachName: r.coach_name ?? null,
      sanityServiceId: r.sanity_service_id ?? null,
      serviceTitle: r.sanity_service_id ? serviceMap.get(r.sanity_service_id) ?? "Service" : null,
    }));

    return NextResponse.json({ ok: true, sessions });
  } catch (e: any) {
    // console.error("[api/sessions/mine] error", e);
    return NextResponse.json({ ok: false, error: "server_error", detail: e?.message }, { status: 500 });
  }
}