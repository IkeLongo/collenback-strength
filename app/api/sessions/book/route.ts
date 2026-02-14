// app/api/sessions/book/route.ts
import { NextResponse } from "next/server";
import { withTx } from "@/app/lib/mysql";
import type { ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { auth } from "@/app/actions/nextauth";
import { sendBookingConfirmationEmail } from "@/app/lib/email/sendBookingConfirmation";
import { sendCoachBookingNotificationEmail } from "@/app/lib/email/sendCoachBookingNotification";
import { getCoachContactById } from "@/app/lib/queries/coaches";
import {
  getSubscriptionUsedCountsForWindows,
  type SubscriptionWindow,
} from "@/app/lib/entitlements/subscriptionUsage";

type BookBody = {
  coachId: number | null;
  start: string; // ISO datetime (UTC ISO recommended)
  end: string; // ISO datetime (UTC ISO recommended)
  sanityServiceId?: string | null;
  sanityServiceTitle?: string | null;
  sanityServiceSlug?: string | null;
  location?: string | null;
  notes?: string | null;
};

function isoToMysqlDatetime(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) throw new Error("Invalid datetime");
  // UTC -> "YYYY-MM-DD HH:MM:SS"
  return d.toISOString().slice(0, 19).replace("T", " ");
}

type Entitlement =
  | { kind: "subscription"; subscriptionId: number; paymentId: number | null }
  | { kind: "pack"; packId: number; paymentId: number };

function lockNameForSubscription(subscriptionId: number) {
  return `sub_book_${subscriptionId}`;
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return new Response("Unauthorized", { status: 401 });

  const clientId = Number(session.user.id);
  if (!Number.isFinite(clientId)) {
    return NextResponse.json({ ok: false, error: "invalid_user" }, { status: 400 });
  }

  const clientEmail = session.user.email;
  const clientName = session.user.firstName;
  const clientLastName = session.user.lastName;

  const body = (await req.json()) as BookBody;

  // Require service id for deterministic entitlement matching
  const sanityServiceId = body.sanityServiceId ?? null;
  if (!sanityServiceId) {
    return NextResponse.json({ ok: false, error: "missing_service" }, { status: 400 });
  }

  const startDt = isoToMysqlDatetime(body.start);
  const endDt = isoToMysqlDatetime(body.end);

  try {
    const created = await withTx<{ sessionId: number; entitlement: Entitlement }>(async (conn) => {
      // 1) Overlap check (locks matching rows)
      const [overlap] = await conn.execute<RowDataPacket[]>(
        `
        SELECT id
        FROM sessions
        WHERE coach_id <=> ?
          AND status = 'scheduled'
          AND scheduled_start < ?
          AND scheduled_end > ?
        LIMIT 1
        FOR UPDATE
        `,
        [body.coachId, endDt, startDt]
      );

      if (overlap.length > 0) {
        const err: any = new Error("Slot already taken");
        err.code = "SLOT_TAKEN";
        throw err;
      }

      // 2) Resolve entitlement
      //    Priority: subscription for this service WITH capacity remaining this period
      //    Fallback: pack credits for this service
      let entitlement: Entitlement | null = null;

      // 2a) Candidate subscriptions (lock rows)
      const [subCandidates] = await conn.execute<RowDataPacket[]>(
        `
        SELECT
          s.id AS subscription_id,
          s.current_period_start,
          s.current_period_end,
          s.sessions_per_period
        FROM subscriptions s
        WHERE s.user_id = ?
          AND s.status IN ('trialing','active')
          AND s.sanity_service_id = ?
          AND s.current_period_start IS NOT NULL
          AND s.current_period_end IS NOT NULL
          AND s.current_period_end > UTC_TIMESTAMP()
        ORDER BY COALESCE(s.current_period_end, '9999-12-31') ASC, s.id ASC
        LIMIT 25
        FOR UPDATE
        `,
        [clientId, sanityServiceId]
      );

      if (subCandidates.length > 0) {
        // Try each subscription in priority order. Use GET_LOCK to make this race-safe.
        for (const row of subCandidates as any[]) {
          const subscriptionId = Number(row.subscription_id);
          const periodStart = row.current_period_start as Date | null;
          const periodEnd = row.current_period_end as Date | null;
          const sessionsPerPeriod = Number(row.sessions_per_period ?? 0);

          if (!subscriptionId || !periodStart || !periodEnd || sessionsPerPeriod <= 0) continue;

          const lockName = lockNameForSubscription(subscriptionId);

          const [lockRows] = await conn.query<any[]>(
            `SELECT GET_LOCK(?, 5) AS got`,
            [lockName]
          );
          const got = Number(lockRows?.[0]?.got ?? 0);
          if (got !== 1) continue;

          try {
            const usage = await getSubscriptionUsedCountsForWindows({
              conn,
              userId: clientId,
              windows: [
                {
                  subscription_id: subscriptionId,
                  period_start: periodStart,
                  period_end: periodEnd,
                } satisfies SubscriptionWindow,
              ],
            });

            const used = usage.get(subscriptionId) ?? 0;

            if (used < sessionsPerPeriod) {
              // Optional: attach latest payment id for this subscription (nice for auditing)
              const [payRows] = await conn.execute<RowDataPacket[]>(
                `
                SELECT id
                FROM payments
                WHERE user_id = ?
                  AND subscription_id = ?
                  AND status IN ('pending','succeeded','refunded')
                ORDER BY id DESC
                LIMIT 1
                `,
                [clientId, subscriptionId]
              );

              const paymentId = payRows.length ? Number((payRows[0] as any).id) : null;
              entitlement = { kind: "subscription", subscriptionId, paymentId };
              break;
            }
          } finally {
            // Always release lock
            await conn.query(`SELECT RELEASE_LOCK(?)`, [lockName]);
          }
        }
      }

      // 2b) If no bookable subscription found, try pack
      if (!entitlement) {
        const [packRows] = await conn.execute<RowDataPacket[]>(
          `
          SELECT id, payment_id
          FROM packs
          WHERE user_id = ?
            AND status = 'active'
            AND sanity_service_id = ?
            AND (expires_at IS NULL OR expires_at > UTC_TIMESTAMP())
            AND (total_credits - credits_used - credits_reserved) >= 1
          ORDER BY COALESCE(expires_at, '9999-12-31') ASC, created_at ASC
          LIMIT 1
          FOR UPDATE
          `,
          [clientId, sanityServiceId]
        );

        if (packRows.length === 0) {
          const err: any = new Error("No entitlement (no subscription capacity and no pack credits)");
          err.code = "NO_ENTITLEMENT";
          throw err;
        }

        const packId = Number((packRows[0] as any).id);
        const paymentId = Number((packRows[0] as any).payment_id);
        entitlement = { kind: "pack", packId, paymentId };
      }

      // 3) Insert session (pack_id/subscription_id set based on entitlement)
      const [ins] = await conn.execute<ResultSetHeader>(
        `
        INSERT INTO sessions
          (client_id, coach_id, sanity_service_id, sanity_service_slug,
           scheduled_start, scheduled_end, status,
           pack_id, subscription_id, charged, location, notes)
        VALUES
          (?, ?, ?, ?, ?, ?, 'scheduled',
           ?, ?, 1, ?, ?)
        `,
        [
          clientId,
          body.coachId,
          sanityServiceId,
          body.sanityServiceSlug ?? null,
          startDt,
          endDt,
          entitlement.kind === "pack" ? entitlement.packId : null,
          entitlement.kind === "subscription" ? entitlement.subscriptionId : null,
          body.location ?? null,
          body.notes ?? null,
        ]
      );

      // If your column is still credits_charged, replace "charged" above with "credits_charged"

      const newSessionId = ins.insertId;

      // 4) Apply entitlement side-effects + ledger entry
      if (entitlement.kind === "pack") {
        const [upd] = await conn.execute<ResultSetHeader>(
          `
          UPDATE packs
          SET credits_reserved = credits_reserved + 1
          WHERE id = ?
            AND (total_credits - credits_used - credits_reserved) >= 1
          `,
          [entitlement.packId]
        );

        if (upd.affectedRows !== 1) {
          const err: any = new Error("Pack reservation failed");
          err.code = "RESERVE_FAILED";
          throw err;
        }

        await conn.execute(
          `
          INSERT INTO credit_transactions
            (user_id, pack_id, session_id, payment_id, subscription_id, type, amount, note)
          VALUES
            (?, ?, ?, ?, NULL, 'reserve', 1, 'Reserved 1 pack credit for scheduled session')
          `,
          [clientId, entitlement.packId, newSessionId, entitlement.paymentId]
        );
      } else {
        await conn.execute(
          `
          INSERT INTO credit_transactions
            (user_id, pack_id, session_id, payment_id, subscription_id, type, amount, note)
          VALUES
            (?, NULL, ?, ?, ?, 'reserve', 1, 'Scheduled session covered by active subscription')
          `,
          [clientId, newSessionId, entitlement.paymentId, entitlement.subscriptionId]
        );
      }

      return { sessionId: newSessionId, entitlement };
    });

    // Email (best-effort)
    if (typeof clientEmail === "string" && clientEmail) {
      try {
        await sendBookingConfirmationEmail({
          to: clientEmail,
          firstName: clientName,
          lastName: clientLastName,
          start: body.start,
          end: body.end,
          serviceTitle: body.sanityServiceTitle || undefined,
        });
      } catch {}
    }

    // Coach email (best-effort) - ✅ CRITICAL: Await for Vercel serverless
    if (body.coachId) {
      try {
        const coach = await getCoachContactById(body.coachId);
        if (coach?.email) {
          await sendCoachBookingNotificationEmail({
            to: coach.email,
            coachName: coach.name || undefined,
            clientName: [clientName, clientLastName].filter(Boolean).join(" ") || undefined,
            clientEmail: typeof clientEmail === "string" ? clientEmail : undefined,
            clientPhone: session.user.phone || undefined,
            start: body.start,
            end: body.end,
            serviceTitle: body.sanityServiceTitle ?? undefined,
          }).catch(() => {});
        }
      } catch {}
    }

    return NextResponse.json({
      ok: true,
      sessionId: created.sessionId,
      entitlement: created.entitlement.kind,
    });
  } catch (e: any) {
    const detail = e?.sqlMessage || e?.message || "Unknown error";

    if (e?.code === "SLOT_TAKEN") {
      return NextResponse.json({ ok: false, error: "slot_taken" }, { status: 409 });
    }
    if (e?.code === "NO_ENTITLEMENT") {
      return NextResponse.json({ ok: false, error: "no_entitlement" }, { status: 402 });
    }
    if (e?.code === "RESERVE_FAILED") {
      return NextResponse.json({ ok: false, error: "reserve_failed" }, { status: 409 });
    }

    return NextResponse.json({ ok: false, error: "server_error", detail }, { status: 500 });
  }
}
