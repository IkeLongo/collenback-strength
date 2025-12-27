import { NextResponse } from "next/server";
import type { RowDataPacket } from "mysql2/promise";
import { pool } from "@/app/lib/mysql";
import { requireAdmin } from "@/app/lib/auth/requireAdmin";
import { getServicesByIds } from "@/sanity/lib/queries/getServiceByIds";
import { SERVICE_CATEGORY_LABELS } from "@/app/lib/constants/serviceCategories";

type Bucket = "upcoming" | "past" | "needs_action" | "all";

const ALLOWED_STATUSES = new Set(["scheduled", "completed", "cancelled", "no_show"]);
const ALLOWED_BUCKETS = new Set(["upcoming", "past", "needs_action", "all"]);

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}
function toIntStrict(v: string | null, fallback: number) {
  if (v == null || v.trim() === "") return fallback;
  const n = parseInt(v, 10);
  return Number.isFinite(n) ? n : fallback;
}

export async function GET(req: Request) {
  const guard = await requireAdmin();
  if (!guard.ok) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const url = new URL(req.url);

  const bucketRaw = url.searchParams.get("bucket") ?? "upcoming";
  const bucket = (ALLOWED_BUCKETS.has(bucketRaw) ? bucketRaw : "upcoming") as Bucket;

  const statusRaw = url.searchParams.get("status");
  const status = statusRaw && ALLOWED_STATUSES.has(statusRaw) ? statusRaw : null;

  const limit = clamp(toIntStrict(url.searchParams.get("limit"), 50), 1, 200);
  const offset = Math.max(0, toIntStrict(url.searchParams.get("offset"), 0));

  const coachId = url.searchParams.get("coachId");
  const clientId = url.searchParams.get("clientId");

  const from = url.searchParams.get("from"); // YYYY-MM-DD
  const to = url.searchParams.get("to");     // YYYY-MM-DD
  const q = url.searchParams.get("q");

  const where: string[] = [];
  const params: any[] = [];

  // Bucket logic
  if (bucket === "upcoming") {
    where.push("s.scheduled_start >= NOW()");
  } else if (bucket === "past") {
    where.push("s.scheduled_start < NOW()");
  } else if (bucket === "needs_action") {
    where.push("s.status = 'scheduled'");
    where.push("s.scheduled_end < (NOW() - INTERVAL 2 HOUR)");
  } else if (bucket !== "all") {
    return NextResponse.json({ message: "Invalid bucket" }, { status: 400 });
  }

  // Status filter
  if (status) {
    where.push("s.status = ?");
    params.push(status);
  }

  // Coach/client filters
  if (coachId) {
    where.push("s.coach_id = ?");
    params.push(Number(coachId));
  }
  if (clientId) {
    where.push("s.client_id = ?");
    params.push(Number(clientId));
  }

  // Date range filters
  if (from) {
    where.push("s.scheduled_start >= ?");
    params.push(`${from} 00:00:00`);
  }
  if (to) {
    where.push("s.scheduled_start <= ?");
    params.push(`${to} 23:59:59`);
  }

  // Search query (client/coach fields)
  if (q && q.trim()) {
    const like = `%${q.trim()}%`;
    where.push(
      `(c.email LIKE ? OR c.first_name LIKE ? OR c.last_name LIKE ?
        OR co.email LIKE ? OR co.first_name LIKE ? OR co.last_name LIKE ?)`
    );
    params.push(like, like, like, like, like, like);
  }

  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

  const sql = `
    SELECT
      s.id,
      s.client_id,
      s.coach_id,
      s.sanity_service_id,
      s.sanity_service_slug,
      s.scheduled_start,
      s.scheduled_end,
      s.status,
      s.cancelled_at,
      s.cancellation_reason,
      s.credit_id,
      s.credits_charged,
      s.location,
      s.notes,
      s.confirmed_by_user_id,
      s.confirmed_at,

      c.email AS client_email,
      c.first_name AS client_first_name,
      c.last_name AS client_last_name,
      c.avatar_key AS client_avatar_key,

      co.email AS coach_email,
      co.first_name AS coach_first_name,
      co.last_name AS coach_last_name,
      co.avatar_key AS coach_avatar_key,

      cb.email AS confirmed_by_email,
      cb.first_name AS confirmed_by_first_name,
      cb.last_name AS confirmed_by_last_name,

      sc.expires_at AS credit_expires_at,
      sc.total_credits AS credit_total_credits,
      sc.credits_used AS credit_credits_used,
      sc.credits_reserved AS credit_credits_reserved

    FROM sessions s
    JOIN users c ON c.id = s.client_id
    LEFT JOIN users co ON co.id = s.coach_id
    LEFT JOIN users cb ON cb.id = s.confirmed_by_user_id
    LEFT JOIN session_credits sc ON sc.id = s.credit_id

    ${whereSql}

    ORDER BY s.scheduled_start ASC
    LIMIT ? OFFSET ?;
  `;

  // IMPORTANT: pool.query wants [sql, values] where values includes LIMIT/OFFSET too
  const finalParams = [...params, Number(limit), Number(offset)];

  try {
    const [rows] = await pool.query<RowDataPacket[]>(sql, finalParams);

    // ---- Enrich with Sanity service meta ----
    const serviceIds = Array.from(
      new Set(
        rows
          .map((r: any) => r.sanity_service_id)
          .filter((id: any) => typeof id === "string" && id.length > 0)
      )
    ) as string[];

    let metaById: Record<string, { title: string; category: string | null }> = {};
    if (serviceIds.length > 0) {
      const services = await getServicesByIds(serviceIds);
      metaById = Object.fromEntries(
        (services ?? []).map((s) => [
          s._id,
          { title: s.title ?? "Service", category: s.category ?? null },
        ])
      );
    }

    const sessions = rows.map((r: any) => {
      const meta = r.sanity_service_id ? metaById[String(r.sanity_service_id)] : null;

      const categoryValue = meta?.category ?? null;
      const categoryTitle =
        categoryValue ? (SERVICE_CATEGORY_LABELS[categoryValue] ?? categoryValue) : null;

      return {
        ...r,
        service_title: meta?.title ?? null,
        service_category: meta?.category ?? null,
        service_category_title: categoryTitle, 
      };
    });

    return NextResponse.json({
      ok: true,
      bucket,
      limit,
      offset,
      sessions,
    });
  } catch (error) {
    // console.error("GET /api/admin/sessions error:", error);
    return NextResponse.json({ message: "Failed to load sessions." }, { status: 500 });
  }
}
