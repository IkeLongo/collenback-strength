import { pool } from "@/app/lib/mysql";
import type { RowDataPacket } from "mysql2/promise";
import { getServicesByIds } from "@/sanity/lib/queries/getServiceByIds";

/** PACK PURCHASE LINE ITEM (one per session_credits row) */
export type PackLineItem = {
  kind: "pack";
  session_credit_id: number;
  purchased_at: Date;
  status: "active" | "refunded" | "voided";
  expires_at: Date | null;

  sanity_service_id: string | null;
  sanity_service_slug: string | null;
  service_title: string | null;
  service_category: string | null;

  total_credits: number;
  credits_used: number;
  credits_reserved: number;
  available_credits: number;

  payment_id: number;
  payment_item_id: number | null;
};

/** PROGRAM PURCHASE LINE ITEM (one per program_entitlements row) */
export type ProgramLineItem = {
  kind: "program";
  program_entitlement_id: number;
  purchased_at: Date;
  status: "active" | "refunded" | "voided";

  sanity_service_id: string | null;
  sanity_service_slug: string | null;
  service_title: string | null;
  service_category: string | null;

  program_version: string | null;
  program_notes: string | null;
  cover_image_url: string | null;
  cover_image_alt: string | null;
  sanity_file_asset_ref: string;

  payment_id: number;
  payment_item_id: number;
};

/** MEMBERSHIP SUMMARY LINE ITEM (one per active subscription row) */
export type MembershipLineItem = {
  subscription_id: number;
  kind: "membership";

  sanity_service_id: string | null;
  sanity_service_slug: string | null;
  service_title: string | null;
  service_category: string | null;

  /** Stripe status */
  status:
    | "trialing"
    | "active"
    | "past_due"
    | "canceled"
    | "unpaid"
    | "incomplete"
    | "incomplete_expired"
    | "paused";

  /** Derived state for UI */
  is_active: boolean;
  state: "active" | "expired";

  current_period_end: Date | null;

  /** Keep parity with pack rows */
  total_credits: null;
  credits_used: null;
  credits_reserved: null;
  available_credits: null;
};

/** unified array for the UI */
export type DashboardLineItem = PackLineItem | MembershipLineItem | ProgramLineItem;

export type PackSummaryRow = {
  sanity_service_id: string;
  sanity_service_slug: string | null;
  service_title: string | null;
  service_category: string | null;
  purchases_count: number;
  total_credits: number;
  credits_used: number;
  credits_reserved: number;
  available_credits: number;
};

export type MembershipSummaryRow = {
  sanity_service_id: string;
  sanity_service_slug: string | null;
  service_title: string | null;
  service_category: string | null;
  memberships_count: number;
  status:
    | "trialing"
    | "active"
    | "past_due"
    | "canceled"
    | "unpaid"
    | "incomplete"
    | "incomplete_expired"
    | "paused";
  current_period_end: Date | null;
};

export type ClientDashboardEntitlements = {
  lineItems: DashboardLineItem[];
  packsSummary: PackSummaryRow[];
  membershipsSummary: MembershipSummaryRow[];
};

type SanityService = {
  _id: string;
  title?: string;
  slug?: { current?: string } | string | null;
  category?: string | null;
  program?: {
    notes?: string | null;
    coverImageAlt?: string | null;
    coverImage?: any; // we'll resolve url in getServicesByIds (recommended)
    coverImageUrl?: string | null; // easiest if getServicesByIds returns this
  } | null;
};

export async function getClientDashboardEntitlements(userId: number): Promise<ClientDashboardEntitlements> {
  const conn = await pool.getConnection();

  try {
    // 1) PACK LINE ITEMS (one per session_credits row)
    const [packRows] = await conn.query<RowDataPacket[]>(
      `
      SELECT
        sc.id AS session_credit_id,
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
      FROM session_credits sc
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
        s.current_period_end,
        s.cancel_at_period_end,
        CASE
          WHEN s.current_period_end IS NOT NULL
          AND s.current_period_end > NOW()
          AND s.status IN ('active','trialing')
          THEN 1 ELSE 0
        END AS is_active
      FROM subscriptions s
      WHERE s.user_id = ?
        AND s.sanity_service_id IS NOT NULL
      ORDER BY
        is_active DESC,
        COALESCE(s.current_period_end, '9999-12-31') ASC,
        s.created_at DESC
      `,
      [userId]
    );

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
        pe.payment_item_id
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

    console.log("[entitlements] sanityServices(program) sample", sanityServices.map((s: any) => ({
      id: s._id,
      title: s.title,
      program: s.program,
    })).slice(0, 10));


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
        session_credit_id: Number(r.session_credit_id),
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
      const slug =
      typeof s?.slug === "string"
        ? s.slug
        : (s?.slug as any)?.current ?? null;

      const isActive = Boolean(m.is_active);

      return {
        subscription_id: Number(m.subscription_id),
        kind: "membership",

        sanity_service_id: sid,
        sanity_service_slug: slug,
        service_title: s?.title ?? null,
        service_category: s?.category ?? null,

        status: m.status,
        is_active: isActive,
        state: isActive ? "active" : "expired",

        current_period_end: m.current_period_end
          ? new Date(m.current_period_end)
          : null,

        total_credits: null,
        credits_used: null,
        credits_reserved: null,
        available_credits: null,
      };
    });

    // 5b) Build PROGRAM line items (with Sanity fields)
    const programLineItems: ProgramLineItem[] = (programRows as any[]).map((p) => {
      const sid = p.sanity_service_id as string;
      const s = sanityMap.get(sid);

      const slug =
        typeof s?.slug === "string"
          ? s.slug
          : (s?.slug as any)?.current ?? null;

      const programNotes = s?.program?.notes ?? null;
      const coverImageUrl = (s?.program as any)?.coverImageUrl ?? null;
      const coverImageAlt = s?.program?.coverImageAlt ?? null;

      return {
        kind: "program",
        program_entitlement_id: Number(p.program_entitlement_id),
        purchased_at: new Date(p.purchased_at),
        status: p.status,

        sanity_service_id: sid,
        sanity_service_slug: slug,
        service_title: s?.title ?? null,
        service_category: s?.category ?? "program",

        program_version: p.program_version ?? null,          // ✅ version locked from DB
        program_notes: programNotes,                         // ✅ from Sanity
        cover_image_url: coverImageUrl,                      // ✅ from Sanity
        cover_image_alt: coverImageAlt,                      // ✅ from Sanity
        sanity_file_asset_ref: String(p.sanity_file_asset_ref),

        payment_id: Number(p.payment_id),
        payment_item_id: Number(p.payment_item_id),
      };
    });

    console.log("[entitlements] programLineItems sample", programLineItems.slice(0, 3));

    // 6) Unified lineItems array for the UI
    const lineItems: DashboardLineItem[] = [...packLineItems, ...membershipLineItems, ...programLineItems].sort((a, b) => {
      // order: membership, pack, program (or whatever you prefer)
      const order: Record<DashboardLineItem["kind"], number> = {
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
        });
      } else {
        existing.memberships_count += 1;
        // Keep the soonest end date (or choose latest—your call; soonest is usually most useful)
        const mEnd = m.current_period_end ? m.current_period_end.getTime() : Number.MAX_SAFE_INTEGER;
        const existingEnd = existing.current_period_end ? existing.current_period_end.getTime() : Number.MAX_SAFE_INTEGER;
        if (mEnd < existingEnd) {
          existing.current_period_end = m.current_period_end;
          existing.status = m.status;
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
