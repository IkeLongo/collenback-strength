import { pool } from "@/app/lib/mysql";
import { getServicesByIds } from "@/sanity/lib/queries/getServiceByIds";
import { getSubscriptionUsedCountsForWindows } from "@/app/lib/entitlements/subscriptionUsage";

import type { PackLineItem, 
  MembershipLineItem,
  ProgramLineItem,
  LineItem,
  PackSummaryRow,
  MembershipSummaryRow,
  ClientDashboardEntitlements,
  SanityService,
} from "@/app/types/entitlements";
import type { RowDataPacket } from "mysql2/promise";

export async function getClientDashboardEntitlements(userId: number): Promise<ClientDashboardEntitlements> {
  const conn = await pool.getConnection();

  try {
    // 1) PACK LINE ITEMS (one per packs row)
    const [packRows] = await conn.query<RowDataPacket[]>(
      `
      SELECT
        sc.id AS pack_id,
        sc.created_at AS purchased_at,
        sc.status,
        sc.expires_at,
        sc.sanity_service_id,
        sc.total_credits,
        sc.credits_used,
        sc.credits_reserved,
        (sc.total_credits - sc.credits_used - sc.credits_reserved) AS available_credits,
        sc.payment_id,
        sc.payment_item_id
      FROM packs sc
      WHERE sc.user_id = ?
        AND sc.status = 'active'
        AND (sc.expires_at IS NULL OR sc.expires_at > NOW())
        AND sc.sanity_service_id IS NOT NULL
      ORDER BY sc.created_at DESC, sc.id DESC
      `,
      [userId]
    );

    // 2) MEMBERSHIPS (active/trialing subscriptions)
    const [membershipsRows] = await conn.query<RowDataPacket[]>(
      `
      SELECT
        s.id AS subscription_id,
        s.sanity_service_id,
        s.status,
        s.current_period_start,
        s.current_period_end,
        s.cancel_at_period_end,
        s.sessions_per_period,
        CASE
          WHEN s.current_period_end IS NOT NULL
          AND s.current_period_end > NOW()
          AND (
            s.status IN ('active','trialing')
            OR (s.cancel_at_period_end = 1)
          )
          THEN 1 ELSE 0
        END AS db_active_flag
      FROM subscriptions s
      WHERE s.user_id = ?
        AND s.sanity_service_id IS NOT NULL
      ORDER BY
        db_active_flag DESC,
        COALESCE(s.current_period_end, '9999-12-31') ASC,
        s.created_at DESC
      `,
      [userId]
    );

    // ✅ Build usage map: subscription_id -> used_count for the CURRENT period
    let membershipUsage = new Map<number, number>();

    if ((membershipsRows as any[]).length > 0) {
      const windows = (membershipsRows as any[]).map((m) => ({
        subscription_id: Number(m.subscription_id),
        period_start: m.current_period_start,
        period_end: m.current_period_end,
      })).filter((w) => w.subscription_id && w.period_start && w.period_end);

      if (windows.length > 0) {
        membershipUsage = await getSubscriptionUsedCountsForWindows({
          conn,
          userId,
          windows,
        });
      }
    }

    // 2b) PROGRAMS (version-locked entitlements)
    const [programRows] = await conn.query<RowDataPacket[]>(
      `
      SELECT
        pe.id AS program_entitlement_id,
        pe.created_at AS purchased_at,
        pe.status,
        pe.sanity_service_id,
        pe.sanity_file_asset_ref,
        pe.program_version,
        pe.payment_id,
        pe.payment_item_id,
        pe.program_notes_snapshot,
        pe.cover_image_url_snapshot,
        pe.cover_image_alt_snapshot
      FROM program_entitlements pe
      WHERE pe.user_id = ?
        AND pe.status = 'active'
        AND pe.sanity_service_id IS NOT NULL
      ORDER BY pe.created_at DESC, pe.id DESC
      `,
      [userId]
    );

    // 3) Fetch Sanity info for all ids (packs + memberships)
    const ids = Array.from(
      new Set(
        [
          ...(packRows as any[]).map((r) => r.sanity_service_id).filter(Boolean),
          ...(membershipsRows as any[]).map((m) => m.sanity_service_id).filter(Boolean),
          ...(programRows as any[]).map((p) => p.sanity_service_id).filter(Boolean),
        ] as string[]
      )
    );

    const sanityServices = (await getServicesByIds(ids)) as SanityService[];
    const sanityMap = new Map<string, SanityService>();
    sanityServices.forEach((s) => sanityMap.set(s._id, s));

    // console.log("[entitlements] sanityServices(program) sample", sanityServices.map((s: any) => ({
    //   id: s._id,
    //   title: s.title,
    //   program: s.program,
    // })).slice(0, 10));


    // 4) Build PACK line items (with Sanity fields)
    const packLineItems: PackLineItem[] = (packRows as any[]).map((r) => {
      const sid = r.sanity_service_id as string;
      const s = sanityMap.get(sid);

      const slug =
      typeof s?.slug === "string"
        ? s.slug
        : (s?.slug as any)?.current ?? null;

      return {
        kind: "pack",
        pack_id: Number(r.pack_id),
        purchased_at: new Date(r.purchased_at),
        status: r.status,
        expires_at: r.expires_at ? new Date(r.expires_at) : null,

        sanity_service_id: sid,
        sanity_service_slug: slug,
        service_title: s?.title ?? null,
        service_category: s?.category ?? null,

        total_credits: Number(r.total_credits ?? 0),
        credits_used: Number(r.credits_used ?? 0),
        credits_reserved: Number(r.credits_reserved ?? 0),
        available_credits: Math.max(0, Number(r.available_credits ?? 0)),

        payment_id: Number(r.payment_id),
        payment_item_id: r.payment_item_id ? Number(r.payment_item_id) : null,
      };
    });

    // 5) Build MEMBERSHIP "summary line items" (with Sanity fields)
    const membershipLineItems: MembershipLineItem[] = (membershipsRows as any[]).map((m) => {
      const sid = m.sanity_service_id as string;
      const s = sanityMap.get(sid);
      const slug = typeof s?.slug === "string" ? s.slug : (s?.slug as any)?.current ?? null;

      const isActive = Boolean(m.db_active_flag);

      const sessionsPerPeriod = Number(m.sessions_per_period ?? 0);
      const used = membershipUsage.get(Number(m.subscription_id)) ?? 0;
      const available = Math.max(0, sessionsPerPeriod - used);

      return {
        subscription_id: Number(m.subscription_id),
        kind: "membership",

        sanity_service_id: sid,
        sanity_service_slug: slug,
        service_title: s?.title ?? null,
        service_category: s?.category ?? null,

        status: m.status,
        db_active_flag: isActive,
        state: isActive ? "active" : "expired",

        current_period_start: m.current_period_start ? new Date(m.current_period_start) : null,
        current_period_end: m.current_period_end ? new Date(m.current_period_end) : null,
        cancel_at_period_end: Boolean(m.cancel_at_period_end),

        sessions_per_period: sessionsPerPeriod,
        sessions_used_period: used,
        sessions_available_period: available,
      };
    });

    // 5b) Build PROGRAM line items (with Sanity fields)
    const programLineItems: ProgramLineItem[] = (programRows as any[]).map((p) => {
      const sid = p.sanity_service_id as string;
      const s = sanityMap.get(sid);

      const slug =
        p.sanity_service_slug ??
        (typeof s?.slug === "string" ? s.slug : (s?.slug as any)?.current ?? null);

      return {
        kind: "program",
        program_entitlement_id: Number(p.program_entitlement_id),
        purchased_at: new Date(p.purchased_at),
        status: p.status,

        sanity_service_id: sid,
        sanity_service_slug: slug,
        service_title: s?.title ?? null,
        service_category: s?.category ?? "program",

        // ✅ version-locked fields now come from DB snapshots
        program_version: p.program_version ?? null,
        program_notes: p.program_notes_snapshot ?? null,
        cover_image_url: p.cover_image_url_snapshot ?? null,
        cover_image_alt: p.cover_image_alt_snapshot ?? null,
        sanity_file_asset_ref: String(p.sanity_file_asset_ref),

        payment_id: Number(p.payment_id),
        payment_item_id: Number(p.payment_item_id),
      };
    });

    // console.log("[entitlements] programLineItems sample", programLineItems.slice(0, 3));

    // 6) Unified lineItems array for the UI
    const lineItems: LineItem[] = [...packLineItems, ...membershipLineItems, ...programLineItems].sort((a, b) => {
      // order: membership, pack, program (or whatever you prefer)
      const order: Record<LineItem["kind"], number> = {
        membership: 0,
        pack: 1,
        program: 2,
      };
      if (a.kind !== b.kind) return order[a.kind] - order[b.kind];

      if (a.kind === "pack" && b.kind === "pack") {
        return b.purchased_at.getTime() - a.purchased_at.getTime();
      }

      if (a.kind === "program" && b.kind === "program") {
        return b.purchased_at.getTime() - a.purchased_at.getTime();
      }

      if (a.kind === "membership" && b.kind === "membership") {
        const aEnd = a.current_period_end ? a.current_period_end.getTime() : Number.MAX_SAFE_INTEGER;
        const bEnd = b.current_period_end ? b.current_period_end.getTime() : Number.MAX_SAFE_INTEGER;
        return aEnd - bEnd;
      }

      return 0;
    });

    // 7) Packs summary (same as before)
    const summaryMap = new Map<string, PackSummaryRow>();

    for (const li of packLineItems) {
      const sid = li.sanity_service_id!;
      const existing = summaryMap.get(sid);

      if (!existing) {
        summaryMap.set(sid, {
          sanity_service_id: sid,
          sanity_service_slug: li.sanity_service_slug,
          service_title: li.service_title,
          service_category: li.service_category,
          purchases_count: 1,
          total_credits: li.total_credits,
          credits_used: li.credits_used,
          credits_reserved: li.credits_reserved,
          available_credits: li.available_credits,
        });
      } else {
        existing.purchases_count += 1;
        existing.total_credits += li.total_credits;
        existing.credits_used += li.credits_used;
        existing.credits_reserved += li.credits_reserved;
        existing.available_credits += li.available_credits;
      }
    }

    const packsSummary = Array.from(summaryMap.values());

    // 8) Memberships summary (Sanity-driven)
    const membershipSummaryMap = new Map<string, MembershipSummaryRow>();

    for (const m of membershipLineItems) {
      const sid = m.sanity_service_id!;
      const existing = membershipSummaryMap.get(sid);

      if (!existing) {
        membershipSummaryMap.set(sid, {
          sanity_service_id: sid,
          sanity_service_slug: m.sanity_service_slug,
          service_title: m.service_title,
          service_category: m.service_category,
          memberships_count: 1,
          status: m.status,
          current_period_end: m.current_period_end,
          cancel_at_period_end: m.cancel_at_period_end,
        });
      } else {
        existing.memberships_count += 1;
        // Keep the soonest end date (or choose latest—your call; soonest is usually most useful)
        const mEnd = m.current_period_end ? m.current_period_end.getTime() : Number.MAX_SAFE_INTEGER;
        const existingEnd = existing.current_period_end ? existing.current_period_end.getTime() : Number.MAX_SAFE_INTEGER;
        if (mEnd < existingEnd) {
          existing.current_period_end = m.current_period_end;
          existing.status = m.status;
          existing.cancel_at_period_end = m.cancel_at_period_end;
        }
      }
    }

    const membershipsSummary = Array.from(membershipSummaryMap.values()).sort(
      (a, b) => {
        const aEnd = a.current_period_end ? a.current_period_end.getTime() : Number.MAX_SAFE_INTEGER;
        const bEnd = b.current_period_end ? b.current_period_end.getTime() : Number.MAX_SAFE_INTEGER;
        return aEnd - bEnd;
      }
    );

    return { lineItems, packsSummary, membershipsSummary };
  } finally {
    conn.release();
  }
}
