import { NextResponse } from "next/server";
import type { RowDataPacket } from "mysql2/promise";
import { pool } from "@/app/lib/mysql";
import { requireAdmin } from "@/app/lib/auth/requireAdmin";

type Outcome =
  | "complete"
  | "cancel_release"
  | "no_show_charge"
  | "no_show_release";

type Body = {
  outcome: Outcome;
  note?: string | null;
  cancellationReason?: string | null;
};

function isOutcome(x: any): x is Outcome {
  return (
    x === "complete" ||
    x === "cancel_release" ||
    x === "no_show_charge" ||
    x === "no_show_release"
  );
}

export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const guard = await requireAdmin();
  if (!guard.ok) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const adminUserId = Number((guard.session!.user as any).id);

  const { id } = await ctx.params;
  const sessionId = Number(id);
  if (!Number.isFinite(sessionId)) {
    return NextResponse.json({ message: "Invalid session id" }, { status: 400 });
  }

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ message: "Invalid JSON body" }, { status: 400 });
  }

  if (!isOutcome(body.outcome)) {
    return NextResponse.json(
      { message: "Invalid outcome" },
      { status: 400 }
    );
  }

  const note = (body.note ?? null)?.toString().slice(0, 255) ?? null;
  const cancellationReason =
    (body.cancellationReason ?? null)?.toString().slice(0, 255) ?? null;

  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    // 1) Lock session row (SELECT, not UPDATE)
    const [sessionRows] = await conn.execute<RowDataPacket[]>(
      `
      SELECT
        id, client_id, coach_id,
        credit_id, credits_charged,
        status,
        scheduled_start, scheduled_end
      FROM sessions
      WHERE id = ?
      FOR UPDATE
      `,
      [sessionId]
    );

    if (sessionRows.length === 0) {
      await conn.rollback();
      return NextResponse.json({ message: "Session not found" }, { status: 404 });
    }

    const s = sessionRows[0];
    const currentStatus = String(s.status);
    const clientId = Number(s.client_id);
    const creditId = s.credit_id != null ? Number(s.credit_id) : null;
    const creditsCharged = Number(s.credits_charged ?? 1);

    // MVP rule: only finalize scheduled sessions
    if (currentStatus !== "scheduled") {
      await conn.rollback();
      return NextResponse.json(
        { message: `Session is already finalized (status=${currentStatus}).` },
        { status: 409 }
      );
    }

    if (!creditId) {
      await conn.rollback();
      return NextResponse.json(
        { message: "Session has no linked credit_id. Cannot finalize." },
        { status: 400 }
      );
    }

    if (!Number.isFinite(creditsCharged) || creditsCharged <= 0) {
      await conn.rollback();
      return NextResponse.json(
        { message: "Invalid credits_charged on session." },
        { status: 400 }
      );
    }

    // 2) Lock credit row
    const [creditRows] = await conn.execute<RowDataPacket[]>(
      `
      SELECT
        id, user_id,
        total_credits, credits_used, credits_reserved,
        status, expires_at
      FROM session_credits
      WHERE id = ?
      FOR UPDATE
      `,
      [creditId]
    );

    if (creditRows.length === 0) {
      await conn.rollback();
      return NextResponse.json(
        { message: "Linked session credit not found." },
        { status: 400 }
      );
    }

    const sc = creditRows[0];

    // basic validations
    if (String(sc.status) !== "active") {
      await conn.rollback();
      return NextResponse.json(
        { message: `Credits are not active (status=${sc.status}).` },
        { status: 400 }
      );
    }

    // This should normally be true; if it's not, it indicates drift
    const reserved = Number(sc.credits_reserved);
    if (reserved < creditsCharged) {
      await conn.rollback();
      return NextResponse.json(
        {
          message:
            "Not enough reserved credits for this session. (Data mismatch: reserved < credits_charged)",
          details: { reserved, creditsCharged },
        },
        { status: 400 }
      );
    }

    // 3) Decide final session.status and transaction type
    const isConsume =
      body.outcome === "complete" || body.outcome === "no_show_charge";

    const finalSessionStatus =
      body.outcome === "complete"
        ? "completed"
        : body.outcome === "cancel_release"
        ? "cancelled"
        : "no_show";

    const txType = isConsume ? "consume" : "release";

    // 4) Update sessions row
    if (finalSessionStatus === "cancelled") {
      await conn.execute(
        `
        UPDATE sessions
        SET
          status = 'cancelled',
          cancelled_at = NOW(),
          cancellation_reason = ?,
          confirmed_by_user_id = ?,
          confirmed_at = NOW()
        WHERE id = ? AND status = 'scheduled'
        `,
        [cancellationReason, adminUserId, sessionId]
      );
    } else {
      await conn.execute(
        `
        UPDATE sessions
        SET
          status = ?,
          confirmed_by_user_id = ?,
          confirmed_at = NOW()
        WHERE id = ? AND status = 'scheduled'
        `,
        [finalSessionStatus, adminUserId, sessionId]
      );
    }

    // 5) Update credits (always reduce reserved; sometimes increase used)
    if (isConsume) {
      await conn.execute(
        `
        UPDATE session_credits
        SET
          credits_reserved = credits_reserved - ?,
          credits_used = credits_used + ?
        WHERE id = ?
        `,
        [creditsCharged, creditsCharged, creditId]
      );
    } else {
      await conn.execute(
        `
        UPDATE session_credits
        SET
          credits_reserved = credits_reserved - ?
        WHERE id = ?
        `,
        [creditsCharged, creditId]
      );
    }

    // 6) Write credit transaction (unique(session_id,type) prevents duplicates)
    // Note: amount is positive by convention; type describes direction.
    try {
      await conn.execute(
        `
        INSERT INTO credit_transactions
          (user_id, session_credit_id, session_id, type, amount, note, created_at)
        VALUES
          (?, ?, ?, ?, ?, ?, NOW())
        `,
        [clientId, creditId, sessionId, txType, creditsCharged, note]
      );
    } catch (err: any) {
      // Duplicate consume/release for same session, or other constraint
      const msg = String(err?.message ?? "");
      const code = String(err?.code ?? "");
      if (code === "ER_DUP_ENTRY" || msg.toLowerCase().includes("duplicate")) {
        await conn.rollback();
        return NextResponse.json(
          { message: "This session was already finalized (duplicate transaction)." },
          { status: 409 }
        );
      }
      throw err;
    }

    // 7) Commit
    await conn.commit();

    // Return a simple payload (you can expand later)
    return NextResponse.json({
      ok: true,
      sessionId,
      finalStatus: finalSessionStatus,
      creditsCharged,
      creditTransactionType: txType,
      finalizedByAdminUserId: adminUserId,
    });
  } catch (error: any) {
    try {
      await conn.rollback();
    } catch {}

    // console.error("Confirm session error:", error);

    return NextResponse.json(
      { message: "Failed to finalize session.", error: String(error?.message ?? error) },
      { status: 500 }
    );
  }
}
