// app/api/sessions/[id]/no-show/route.ts
import { NextResponse } from "next/server";
import type { ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { withTx } from "@/app/lib/mysql";
import { auth } from "@/app/actions/nextauth";
import { getUserByIdWithRole, getUserById } from "@/app/lib/queries/users";
import { getServicesByIds } from "@/sanity/lib/queries/getServiceByIds";
import { fetchServiceCategories } from "@/sanity/lib/queries/categories";
import { getCoachContactById } from "@/app/lib/queries/coaches";
import {
  sendCoachNoShowNotificationEmail,
  sendClientNoShowNotificationEmail,
} from "@/app/lib/email/sendCancelConfirmation";

type RouteContext = {
  params: Promise<{ id: string }>;
};

type NoShowBody = {
  reason?: string;
};

/**
 * MySQL DATETIME (assumed UTC) -> real UTC ISO string.
 */
function mysqlUtcDatetimeToIso(input: unknown): string {
  if (input instanceof Date) {
    return input.toISOString();
  }

  if (typeof input === "string") {
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

  // Check if user is admin (only admins can mark no-show)
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

  if (!isAdmin) {
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
  }

  const body = (await req.json().catch(() => ({}))) as NoShowBody;
  const reason = (body?.reason ?? "").trim() || "Client did not show up for scheduled session";

  let emailContext: null | {
    coachId: number | null;
    startIso: string;
    endIso: string;
    serviceTitle?: string | null;
  } = null;

  let targetClientId: number | null = null;
  let targetCoachId: number | null = null;
  let payload: any = { ok: true };

  try {
    await withTx(async (conn) => {
      // 1) Fetch the session row
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
          TIMESTAMPDIFF(MINUTE, s.scheduled_start, UTC_TIMESTAMP()) AS minutes_since_start,
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

      // Validate: session must be in the past (or at least started)
      const minutesSinceStart = Number(s.minutes_since_start ?? -999);
      if (minutesSinceStart < 0) {
        const err: any = new Error("Cannot mark no-show for future session");
        err.code = "SESSION_NOT_STARTED";
        throw err;
      }

      // Idempotent: already marked no-show
      if (s.status === "no_show") {
        payload = {
          ok: true,
          alreadyMarked: true,
          status: "no_show",
        };
        return;
      }

      // Only mark no-show if status is "scheduled"
      if (s.status !== "scheduled") {
        const err: any = new Error(`Cannot mark no-show for session with status: ${s.status}`);
        err.code = "INVALID_STATUS";
        throw err;
      }

      targetClientId = s.client_id;
      targetCoachId = s.coach_id;
      const sanityServiceId = s.sanity_service_id;

      // 2) Mark as no-show
      await conn.execute<ResultSetHeader>(
        `
        UPDATE sessions
        SET
          status = 'no_show',
          cancelled_at = NOW(),
          cancellation_reason = ?,
          updated_at = NOW()
        WHERE id = ? AND status = 'scheduled'
        `,
        [reason, sessionId]
      );

      const hasPack = Boolean(s.pack_id);
      const hasSub = Boolean(s.subscription_id);

      const txNote = "No-show: credit consumed";

      // 3) Handle pack entitlement
      if (hasPack) {
        // Insert credit transaction
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
            'consume',
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
          [txNote, sessionId, targetClientId]
        );

        if (ins.affectedRows === 1) {
          // Consume: decrease reserved, increase used
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

        payload = {
          ok: true,
          status: "no_show",
          creditApplied: ins.affectedRows === 1,
          charged: 1,
          entitlement: "pack",
        };

        emailContext = {
          coachId: targetCoachId ? Number(targetCoachId) : null,
          startIso: mysqlUtcDatetimeToIso(s.scheduled_start),
          endIso: mysqlUtcDatetimeToIso(s.scheduled_end),
          serviceTitle: sanityServiceId || null,
        };

        return;
      }

      // 4) Handle subscription entitlement
      if (hasSub) {
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
            'consume',
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
          [txNote, sessionId, targetClientId]
        );

        await conn.execute<ResultSetHeader>(
          `UPDATE sessions SET charged = 1 WHERE id = ? AND client_id = ?`,
          [sessionId, targetClientId]
        );

        payload = {
          ok: true,
          status: "no_show",
          charged: 1,
          entitlement: "subscription",
        };

        emailContext = {
          coachId: targetCoachId ? Number(targetCoachId) : null,
          startIso: mysqlUtcDatetimeToIso(s.scheduled_start),
          endIso: mysqlUtcDatetimeToIso(s.scheduled_end),
          serviceTitle: sanityServiceId || null,
        };

        return;
      }

      // 5) No entitlement attached
      await conn.execute<ResultSetHeader>(
        `UPDATE sessions SET charged = 1 WHERE id = ? AND client_id = ?`,
        [sessionId, targetClientId]
      );

      payload = {
        ok: true,
        status: "no_show",
        charged: 1,
        entitlement: "none",
      };

      emailContext = {
        coachId: targetCoachId ? Number(targetCoachId) : null,
        startIso: mysqlUtcDatetimeToIso(s.scheduled_start),
        endIso: mysqlUtcDatetimeToIso(s.scheduled_end),
        serviceTitle: sanityServiceId || null,
      };
    });

    // Send emails after commit
    if (emailContext) {
      const { coachId, startIso, endIso, serviceTitle: sanityServiceId } = emailContext;

      // Fetch service category from Sanity
      let serviceCategory: string | undefined = undefined;
      if (sanityServiceId) {
        const sanityServices = await getServicesByIds([sanityServiceId]);
        const categoryValue = sanityServices[0]?.category ?? "Session";
        let categoryTitle = "Session";
        try {
          const categories = await fetchServiceCategories();
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

      // Fetch client info
      let clientName: string | undefined = undefined;
      let clientEmail: string | undefined = undefined;
      let clientPhone: string | undefined = undefined;
      if (targetClientId) {
        const clientArr = await getUserById(targetClientId);
        const client = clientArr[0];
        if (client) {
          clientName = [client.first_name, client.last_name].filter(Boolean).join(" ") || undefined;
          clientEmail = client.email || undefined;
          clientPhone = client.phone || undefined;
        }
      }

      // Fetch coach info
      let coachName: string | undefined = undefined;
      let coachEmail: string | undefined = undefined;
      if (coachId) {
        const coach = await getCoachContactById(coachId);
        coachName = coach?.name || undefined;
        coachEmail = coach?.email || undefined;
      }

      const emailPromises: Promise<any>[] = [];

      // Client email
      if (clientEmail) {
        emailPromises.push(
          sendClientNoShowNotificationEmail({
            to: clientEmail,
            clientName,
            coachName,
            start: startIso,
            end: endIso,
            serviceTitle: serviceCategory ?? undefined,
          }).catch(() => {})
        );
      }

      // Coach email
      if (coachEmail) {
        emailPromises.push(
          sendCoachNoShowNotificationEmail({
            to: coachEmail,
            coachName,
            clientName,
            clientEmail: clientEmail || undefined,
            clientPhone: clientPhone || undefined,
            start: startIso,
            end: endIso,
            serviceTitle: serviceCategory ?? undefined,
          }).catch(() => {})
        );
      }

      await Promise.allSettled(emailPromises);
    }

    return NextResponse.json(payload);
  } catch (e: any) {
    if (e?.code === "NOT_FOUND") {
      return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
    }
    if (e?.code === "SESSION_NOT_STARTED") {
      return NextResponse.json(
        { ok: false, error: "session_not_started", detail: e.message },
        { status: 409 }
      );
    }
    if (e?.code === "INVALID_STATUS") {
      return NextResponse.json(
        { ok: false, error: "invalid_status", detail: e.message },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { ok: false, error: "server_error", detail: e?.message },
      { status: 500 }
    );
  }
}
