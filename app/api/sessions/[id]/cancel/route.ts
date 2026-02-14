// app/api/sessions/[id]/cancel/route.ts
import { NextResponse } from "next/server";
import type { ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { withTx } from "@/app/lib/mysql";
import { auth } from "@/app/actions/nextauth";

type RouteContext = {
  params: Promise<{ id: string }>;
};

type CancelBody = {
  reason?: string;
};

const CUTOFF_MINUTES = 24 * 60;

export async function POST(req: Request, ctx: RouteContext) {
  const { id } = await ctx.params;
  const sessionId = Number(id);

  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const clientId = Number(session.user.id);
  if (!Number.isFinite(sessionId) || !Number.isFinite(clientId)) {
    return NextResponse.json({ ok: false, error: "invalid_input" }, { status: 400 });
  }

  const body = (await req.json().catch(() => ({}))) as CancelBody;
  const reason = (body?.reason ?? "").trim().slice(0, 255) || null;

  try {
    let payload: any = { ok: true };

    await withTx(async (conn) => {
      // 1) Lock session row + compute minutes until start (UTC)
      const [rows] = await conn.execute<RowDataPacket[]>(
        `
        SELECT
          s.id,
          s.client_id,
          s.status,
          s.pack_id,
          s.subscription_id,
          s.charged,
          s.scheduled_start,
          s.scheduled_end,
          TIMESTAMPDIFF(MINUTE, UTC_TIMESTAMP(), s.scheduled_start) AS minutes_until_start,
          p.payment_id AS pack_payment_id
        FROM sessions s
        LEFT JOIN packs p ON p.id = s.pack_id
        WHERE s.id = ? AND s.client_id = ?
        FOR UPDATE
        `,
        [sessionId, clientId]
      );

      if (rows.length === 0) {
        const err: any = new Error("Not found");
        err.code = "NOT_FOUND";
        throw err;
      }

      const s = rows[0] as any;

      const minutesUntilStart = Number(s.minutes_until_start ?? 0);
      const refundable = minutesUntilStart >= CUTOFF_MINUTES;

      const chargedNow = Number(s.charged ?? 1);
      const creditsCharged = Math.max(1, chargedNow); // charged is 0/1, but keep same shape for response

      // Idempotent: if already cancelled, just report policy & exit
      if (s.status === "cancelled") {
        payload = {
          ok: true,
          alreadyCancelled: true,
          refundable,
          policy: refundable ? "release" : "consume",
          minutesUntilStart,
          charged: chargedNow,
          creditApplied: false,
        };
        return;
      }

      if (s.status !== "scheduled") {
        const err: any = new Error("Session cannot be cancelled");
        err.code = "NOT_CANCELLABLE";
        throw err;
      }

      // 2) Mark cancelled
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
        [reason, sessionId, clientId]
      );

      // 3) Determine entitlement type
      const hasPack = Boolean(s.pack_id);
      const hasSub = Boolean(s.subscription_id);

      if (!hasPack && !hasSub) {
        // No entitlement attached (rare) — still update charged based on policy
        if (refundable) {
          await conn.execute<ResultSetHeader>(
            `UPDATE sessions SET charged = 0 WHERE id = ? AND client_id = ?`,
            [sessionId, clientId]
          );
        }
        payload = {
          ok: true,
          refundable,
          policy: refundable ? "release" : "consume",
          minutesUntilStart,
          chargedAfter: refundable ? 0 : chargedNow,
          creditApplied: false,
          note: "No pack_id or subscription_id on session.",
        };
        return;
      }

      const txType: "release" | "consume" = refundable ? "release" : "consume";
      const txNote =
        txType === "release"
          ? "Released entitlement due to cancellation (>= 24h notice)"
          : "Consumed entitlement due to late cancellation (< 24h notice)";

      // 4) PACK PATH
      if (hasPack) {
        // Ensure we only do release/consume once per session
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
          [txType, txNote, sessionId, clientId]
        );

        if (ins.affectedRows === 1) {
          if (txType === "release") {
            // release: reserved decreases; set session charged=0
            await conn.execute<ResultSetHeader>(
              `
              UPDATE packs p
              JOIN sessions s ON s.pack_id = p.id
              SET p.credits_reserved = GREATEST(p.credits_reserved - 1, 0)
              WHERE s.id = ? AND s.client_id = ?
              `,
              [sessionId, clientId]
            );

            await conn.execute<ResultSetHeader>(
              `UPDATE sessions SET charged = 0 WHERE id = ? AND client_id = ?`,
              [sessionId, clientId]
            );
          } else {
            // consume: reserved decreases, used increases; keep charged=1
            await conn.execute<ResultSetHeader>(
              `
              UPDATE packs p
              JOIN sessions s ON s.pack_id = p.id
              SET
                p.credits_reserved = GREATEST(p.credits_reserved - 1, 0),
                p.credits_used = p.credits_used + 1
              WHERE s.id = ? AND s.client_id = ?
              `,
              [sessionId, clientId]
            );

            await conn.execute<ResultSetHeader>(
              `UPDATE sessions SET charged = 1 WHERE id = ? AND client_id = ?`,
              [sessionId, clientId]
            );
          }
        }

        payload = {
          ok: true,
          refundable,
          policy: txType,
          minutesUntilStart,
          creditApplied: ins.affectedRows === 1,
          chargedAfter: txType === "release" ? 0 : 1,
          entitlement: "pack",
        };
        return;
      }

      // 5) SUBSCRIPTION PATH
      // No pack mutation. “Release” = charged=0; “Consume” = charged=1.
      if (hasSub) {
        // Idempotent ledger (optional but recommended for audit)
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
          [txType, txNote, sessionId, clientId]
        );

        // charged update is the *actual* entitlement release/consume behavior
        await conn.execute<ResultSetHeader>(
          `UPDATE sessions SET charged = ? WHERE id = ? AND client_id = ?`,
          [txType === "release" ? 0 : 1, sessionId, clientId]
        );

        payload = {
          ok: true,
          refundable,
          policy: txType,
          minutesUntilStart,
          chargedAfter: txType === "release" ? 0 : 1,
          entitlement: "subscription",
        };
        return;
      }
    });

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
