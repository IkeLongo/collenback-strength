// app/api/sessions/[id]/cancel/route.ts
import { NextResponse } from "next/server";
import type { ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { withTx } from "@/app/lib/mysql";
import { auth } from "@/app/actions/nextauth";
import { getUserByIdWithRole, getUserById } from "@/app/lib/queries/users";
import { getServicesByIds } from "@/sanity/lib/queries/getServiceByIds";
import { fetchServiceCategories } from "@/sanity/lib/queries/categories";
import { getCoachContactById } from "@/app/lib/queries/coaches";
import {
  sendCoachCancelNotificationEmail,
  sendClientCancelConfirmationEmail,
} from "@/app/lib/email/sendCancelConfirmation";

type RouteContext = {
  params: Promise<{ id: string }>;
};

type CancelBody = {
  reason?: string;
};

// comparisons should use MySQL UTC clock (UTC_TIMESTAMP())
const CUTOFF_MINUTES = 24 * 60;

type CancelPolicy = "release" | "consume";

/**
 * MySQL DATETIME (assumed UTC) -> real UTC ISO string.
 * IMPORTANT: we do this so email times render correctly in America/Chicago.
 */
function mysqlUtcDatetimeToIso(input: unknown): string {
  if (input instanceof Date) {
    // best-effort: if mysql2 already shifted, this preserves that shift
    return input.toISOString();
  }

  if (typeof input === "string") {
    // Expect "YYYY-MM-DD HH:MM:SS" (or "YYYY-MM-DDTHH:MM:SS")
    const s = input.trim().replace("T", " ");
    const [datePart, timePart = "00:00:00"] = s.split(" ");
    const [y, m, d] = datePart.split("-").map(Number);
    const [hh, mm, ss] = timePart.split(":").map(Number);

    const utcMs = Date.UTC(y, (m ?? 1) - 1, d ?? 1, hh ?? 0, mm ?? 0, ss ?? 0);
    return new Date(utcMs).toISOString();
  }

  throw new Error("Invalid MySQL datetime value");
}

export async function POST(req: Request, ctx: RouteContext) {
  const { id } = await ctx.params;
  const sessionId = Number(id);

  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const userId = Number(session.user.id);
  if (!Number.isFinite(sessionId) || !Number.isFinite(userId)) {
    return NextResponse.json({ ok: false, error: "invalid_input" }, { status: 400 });
  }

  // Check if user is admin
  let isAdmin = false;
  try {
    const userWithRole = await getUserByIdWithRole(userId);
    if (userWithRole && userWithRole.length > 0) {
      const roles = userWithRole.map((u) => u.role_name);
      isAdmin = roles.includes("admin");
    }
  } catch (e) {
    // fallback: not admin
  }

  const body = (await req.json().catch(() => ({}))) as CancelBody;
  const reason = (body?.reason ?? "").trim().slice(0, 255) || null;

  // We'll email AFTER commit (best-effort), so gather details during the tx.
  let emailContext: null | {
    coachId: number | null;
    startIso: string;
    endIso: string;
    policy: CancelPolicy;
    serviceTitle?: string | null;
  } = null;

  // These will be set inside the transaction and used after
  let targetClientId: number | null = null;
  let targetCoachId: number | null = null;

  // Also helpful to return to the client UI
  let payload: any = { ok: true };

  try {
    await withTx(async (conn) => {
      // 1) Always fetch the session row by id
      const [rows] = await conn.execute<RowDataPacket[]>(
        `
        SELECT
          s.id,
          s.client_id,
          s.status,
          s.coach_id,
          s.pack_id,
          s.subscription_id,
          s.charged,
          s.scheduled_start,
          s.scheduled_end,
          s.sanity_service_id,
          s.sanity_service_slug,
          TIMESTAMPDIFF(MINUTE, UTC_TIMESTAMP(), s.scheduled_start) AS minutes_until_start,
          p.payment_id AS pack_payment_id
        FROM sessions s
        LEFT JOIN packs p ON p.id = s.pack_id
        WHERE s.id = ?
        FOR UPDATE
        `,
        [sessionId]
      );

      if (rows.length === 0) {
        const err: any = new Error("Not found");
        err.code = "NOT_FOUND";
        throw err;
      }

      const s = rows[0] as any;

      // Permission check: admin or client
      if (!isAdmin && s.client_id !== userId) {
        return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
      }

      const minutesUntilStart = Number(s.minutes_until_start ?? 0);
      const refundable = minutesUntilStart >= CUTOFF_MINUTES;
      const policy: CancelPolicy = refundable ? "release" : "consume";

      const chargedNow = Number(s.charged ?? 1);

      // Idempotent: already cancelled -> do NOT re-run ledger or pack math
      if (s.status === "cancelled") {
        payload = {
          ok: true,
          alreadyCancelled: true,
          refundable,
          policy,
          minutesUntilStart,
          charged: chargedNow,
          creditApplied: false,
        };

        // We can still populate emailContext if you *want* to allow re-sending,
        // but defaulting to NO email on idempotent cancel.
        return;
      }

      if (s.status !== "scheduled") {
        const err: any = new Error("Session cannot be cancelled");
        err.code = "NOT_CANCELLABLE";
        throw err;
      }

      // 2) Mark cancelled
      if (isAdmin) {
        await conn.execute<ResultSetHeader>(
          `
          UPDATE sessions
          SET
            status = 'cancelled',
            cancelled_at = NOW(),
            cancellation_reason = ?,
            updated_at = NOW()
          WHERE id = ? AND status = 'scheduled'
          `,
          [reason, sessionId]
        );
      } else {
        await conn.execute<ResultSetHeader>(
          `
          UPDATE sessions
          SET
            status = 'cancelled',
            cancelled_at = NOW(),
            cancellation_reason = ?,
            updated_at = NOW()
          WHERE id = ? AND client_id = ? AND status = 'scheduled'
          `,
          [reason, sessionId, userId]
        );
      }

      const hasPack = Boolean(s.pack_id);
      const hasSub = Boolean(s.subscription_id);

      const txNote =
        policy === "release"
          ? "Released entitlement due to cancellation (>= 24h notice)"
          : "Consumed entitlement due to late cancellation (< 24h notice)";

      // Use the session's client_id for all credit/email logic
      targetClientId = s.client_id;
      targetCoachId = s.coach_id;
      // Store sanity_service_id for later
      const sanityServiceId = s.sanity_service_id;

      // 3) No entitlement attached (rare): only update charged if refundable
      if (!hasPack && !hasSub) {
        if (policy === "release") {
          await conn.execute<ResultSetHeader>(
            `UPDATE sessions SET charged = 0 WHERE id = ? AND client_id = ?`,
            [sessionId, targetClientId]
          );
        }

        payload = {
          ok: true,
          refundable,
          policy,
          minutesUntilStart,
          chargedAfter: policy === "release" ? 0 : chargedNow,
          creditApplied: false,
          entitlement: "none",
        };

        // Email context still useful (coach/client should know it was cancelled)
        emailContext = {
          coachId: targetCoachId ? Number(targetCoachId) : null,
          startIso: mysqlUtcDatetimeToIso(s.scheduled_start),
          endIso: mysqlUtcDatetimeToIso(s.scheduled_end),
          policy,
          serviceTitle: sanityServiceId || null, // placeholder, will fetch after tx
        };

        return;
      }

      // 4) PACK PATH
      if (hasPack) {
        const [ins] = await conn.execute<ResultSetHeader>(
          `
          INSERT INTO credit_transactions
            (user_id, pack_id, session_id, payment_id, subscription_id, type, amount, note)
          SELECT
            s.client_id,
            s.pack_id,
            s.id,
            p.payment_id,
            NULL,
            ?,
            1,
            ?
          FROM sessions s
          JOIN packs p ON p.id = s.pack_id
          WHERE s.id = ?
            AND s.client_id = ?
            AND s.pack_id IS NOT NULL
            AND NOT EXISTS (
              SELECT 1
              FROM credit_transactions ct
              WHERE ct.session_id = s.id
                AND ct.type IN ('release','consume')
            )
          `,
          [policy, txNote, sessionId, targetClientId]
        );

        if (ins.affectedRows === 1) {
          if (policy === "release") {
            // release: reserved decreases; session charged=0
            await conn.execute<ResultSetHeader>(
              `
              UPDATE packs p
              JOIN sessions s ON s.pack_id = p.id
              SET p.credits_reserved = GREATEST(p.credits_reserved - 1, 0)
              WHERE s.id = ? AND s.client_id = ?
              `,
              [sessionId, targetClientId]
            );

            await conn.execute<ResultSetHeader>(
              `UPDATE sessions SET charged = 0 WHERE id = ? AND client_id = ?`,
              [sessionId, targetClientId]
            );
          } else {
            // consume: reserved decreases, used increases; session charged=1
            await conn.execute<ResultSetHeader>(
              `
              UPDATE packs p
              JOIN sessions s ON s.pack_id = p.id
              SET
                p.credits_reserved = GREATEST(p.credits_reserved - 1, 0),
                p.credits_used = p.credits_used + 1
              WHERE s.id = ? AND s.client_id = ?
              `,
              [sessionId, targetClientId]
            );

            await conn.execute<ResultSetHeader>(
              `UPDATE sessions SET charged = 1 WHERE id = ? AND client_id = ?`,
              [sessionId, targetClientId]
            );
          }
        }

        payload = {
          ok: true,
          refundable,
          policy,
          minutesUntilStart,
          creditApplied: ins.affectedRows === 1,
          chargedAfter: policy === "release" ? 0 : 1,
          entitlement: "pack",
        };

        emailContext = {
          coachId: targetCoachId ? Number(targetCoachId) : null,
          startIso: mysqlUtcDatetimeToIso(s.scheduled_start),
          endIso: mysqlUtcDatetimeToIso(s.scheduled_end),
          policy,
          serviceTitle: sanityServiceId || null, // placeholder, will fetch after tx
        };

        return;
      }

      // 5) SUBSCRIPTION PATH
      if (hasSub) {
        // ledger (optional but recommended for audit)
        await conn.execute<ResultSetHeader>(
          `
          INSERT INTO credit_transactions
            (user_id, pack_id, session_id, payment_id, subscription_id, type, amount, note)
          SELECT
            s.client_id,
            NULL,
            s.id,
            NULL,
            s.subscription_id,
            ?,
            1,
            ?
          FROM sessions s
          WHERE s.id = ?
            AND s.client_id = ?
            AND s.subscription_id IS NOT NULL
            AND NOT EXISTS (
              SELECT 1
              FROM credit_transactions ct
              WHERE ct.session_id = s.id
                AND ct.type IN ('release','consume')
            )
          `,
          [policy, txNote, sessionId, targetClientId]
        );

        // “Release” = charged=0; “Consume” = charged=1.
        await conn.execute<ResultSetHeader>(
          `UPDATE sessions SET charged = ? WHERE id = ? AND client_id = ?`,
          [policy === "release" ? 0 : 1, sessionId, targetClientId]
        );

        payload = {
          ok: true,
          refundable,
          policy,
          minutesUntilStart,
          chargedAfter: policy === "release" ? 0 : 1,
          entitlement: "subscription",
        };

        emailContext = {
          coachId: targetCoachId ? Number(targetCoachId) : null,
          startIso: mysqlUtcDatetimeToIso(s.scheduled_start),
          endIso: mysqlUtcDatetimeToIso(s.scheduled_end),
          policy,
          serviceTitle: sanityServiceId || null, // placeholder, will fetch after tx
        };

        return;
      }
    });

    // ✅ Send emails AFTER COMMIT (best-effort; do not fail cancellation if email fails)
    if (emailContext) {
      const { coachId, startIso, endIso, serviceTitle: sanityServiceId, policy } = emailContext;

      // Fetch service category from Sanity and map to display string
      let serviceCategory: string | undefined = undefined;
      if (sanityServiceId) {
        const sanityServices = await getServicesByIds([sanityServiceId]);
        const categoryValue = sanityServices[0]?.category ?? "Session";
        // Fetch category mapping from Sanity
        let categoryTitle = "Session";
        try {
          const categories = await fetchServiceCategories(); // returns array of {value, title}
          const found = categories.find(cat => cat.value === categoryValue);
          categoryTitle = found ? found.title : categoryValue
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
        } catch {}
        serviceCategory = categoryTitle;
      } else {
        serviceCategory = "Session";
      }

      // Always fetch client info by session's client_id
      let clientName: string | undefined = undefined;
      let clientEmail: string | undefined = undefined;
      let clientPhone: string | undefined = undefined;
      if (typeof emailContext !== 'undefined') {
        // getUserById returns User[]
        const clientArr = await getUserById(targetClientId);
        const client = clientArr[0];
        if (client) {
          clientName = [client.first_name, client.last_name].filter(Boolean).join(" ") || undefined;
          clientEmail = client.email || undefined;
          clientPhone = client.phone || undefined;
        }
      }

      // Always fetch coach info by coachId
      let coachName: string | undefined = undefined;
      let coachEmail: string | undefined = undefined;
      if (coachId) {
        const coach = await getCoachContactById(coachId);
        coachName = coach?.name || undefined;
        coachEmail = coach?.email || undefined;
      }

      // ✅ Collect email promises to await them (critical for Vercel serverless)
      const emailPromises: Promise<any>[] = [];

      // client email
      if (clientEmail) {
        emailPromises.push(
          sendClientCancelConfirmationEmail({
            to: clientEmail,
            clientName,
            coachName,
            start: startIso,
            end: endIso,
            serviceTitle: serviceCategory ?? undefined,
            policy,
          }).catch(() => {})
        );
      }

      // coach email
      if (coachEmail) {
        emailPromises.push(
          sendCoachCancelNotificationEmail({
            to: coachEmail,
            coachName,
            clientName,
            clientEmail: clientEmail || undefined,
            clientPhone: clientPhone || undefined,
            start: startIso,
            end: endIso,
            serviceTitle: serviceCategory ?? undefined,
            policy,
          }).catch(() => {})
        );
      }

      // ✅ CRITICAL: Await all emails before returning (prevents Vercel from killing the function)
      await Promise.allSettled(emailPromises);
    }

    return NextResponse.json(payload);
  } catch (e: any) {
    if (e?.code === "NOT_FOUND") {
      return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
    }
    if (e?.code === "NOT_CANCELLABLE") {
      return NextResponse.json(
        { ok: false, error: "not_cancellable", detail: e.message },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { ok: false, error: "server_error", detail: e?.message },
      { status: 500 }
    );
  }
}
