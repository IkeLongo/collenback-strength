// app/api/sessions/book/route.ts
import { NextResponse } from "next/server";
import { withTx } from "@/app/lib/mysql";
import type { ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { auth } from "@/app/actions/nextauth";
import { sendBookingConfirmationEmail } from "@/app/lib/email/sendBookingConfirmation";

type BookBody = {
  coachId: number | null;
  start: string; // ISO datetime
  end: string;   // ISO datetime
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

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  const clientId = Number(session.user.id);
  const clientEmail = session.user.email;
  const clientName = session.user.firstName;
  const clientLastName = session.user.lastName;

  // console.log("[book] clientId", clientId);
  // console.log("[book] clientEmail", clientEmail);
  // console.log("[book] clientName", clientName);

  const body = (await req.json()) as BookBody;

  const startDt = isoToMysqlDatetime(body.start);
  const endDt = isoToMysqlDatetime(body.end);

  try {
    const sessionId = await withTx<number>(async (conn) => {
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

      // 2) Pick credit bucket (lock it)
      const [creditRows] = await conn.execute<RowDataPacket[]>(
        `
        SELECT id, payment_id
        FROM session_credits
        WHERE user_id = ?
          AND status = 'active'
          AND (expires_at IS NULL OR expires_at > NOW())
          AND (total_credits - credits_used - credits_reserved) >= 1
        ORDER BY COALESCE(expires_at, '9999-12-31') ASC, created_at ASC
        LIMIT 1
        FOR UPDATE
        `,
        [clientId]
      );

      if (creditRows.length === 0) {
        const err: any = new Error("Not enough credits");
        err.code = "NO_CREDITS";
        throw err;
      }

      const creditId = Number(creditRows[0].id);
      const paymentId = Number(creditRows[0].payment_id);

      // 3) Insert session (credit_id null until reservation succeeds)
      const [ins] = await conn.execute<ResultSetHeader>(
        `
        INSERT INTO sessions
          (client_id, coach_id, sanity_service_id, sanity_service_slug,
           scheduled_start, scheduled_end, status,
           credit_id, credits_charged, location, notes)
        VALUES
          (?, ?, ?, ?, ?, ?, 'scheduled', NULL, 1, ?, ?)
        `,
        [
          clientId,
          body.coachId,
          body.sanityServiceId ?? null,
          body.sanityServiceSlug ?? null,
          startDt,
          endDt,
          body.location ?? null,
          body.notes ?? null,
        ]
      );

      const newSessionId = ins.insertId;

      // 4) Reserve credit (guard condition)
      const [upd] = await conn.execute<ResultSetHeader>(
        `
        UPDATE session_credits
        SET credits_reserved = credits_reserved + 1
        WHERE id = ?
          AND (total_credits - credits_used - credits_reserved) >= 1
        `,
        [creditId]
      );

      if (upd.affectedRows !== 1) {
        const err: any = new Error("Credit reservation failed");
        err.code = "RESERVE_FAILED";
        throw err;
      }

      // 5) Attach credit to session
      await conn.execute(
        `UPDATE sessions SET credit_id = ? WHERE id = ?`,
        [creditId, newSessionId]
      );

      // 6) Ledger reserve (idempotency not strictly needed on new session, but safe)
      await conn.execute(
        `
        INSERT INTO credit_transactions
          (user_id, session_credit_id, session_id, payment_id, type, amount, note)
        VALUES
          (?, ?, ?, ?, 'reserve', 1, 'Reserved 1 credit for scheduled session')
        `,
        [clientId, creditId, newSessionId, paymentId]
      );

      return newSessionId;
    });

    // Send confirmation email (do not block response on error)
    console.log("[book] about to send email", { clientEmail, clientName });

    console.log("[book] email gate", { clientName, clientEmail, type: typeof clientName });

    if (typeof clientEmail === "string" && clientEmail) {
      try {
        const result = await sendBookingConfirmationEmail({
          to: clientEmail,
          firstName: clientName,
          lastName: clientLastName,
          start: body.start,
          end: body.end,
          serviceTitle: body.sanityServiceTitle || undefined,
        });

        console.log("[book] resend result", result);
      } catch (err) {
        console.error("[book] resend error", err);
      }
    } else {
      console.warn("[book] No valid client email, skipping confirmation email.");
    }
    
    return NextResponse.json({ ok: true, sessionId });
  } catch (e: any) {
    console.error("[book] error", e);

    const detail =
      e?.sqlMessage || e?.message || "Unknown error";

    if (e?.code === "SLOT_TAKEN") return NextResponse.json({ ok: false, error: "slot_taken" }, { status: 409 });
    if (e?.code === "NO_CREDITS") return NextResponse.json({ ok: false, error: "no_credits" }, { status: 402 });

    if (!body.sanityServiceId && !body.sanityServiceSlug) {
      return NextResponse.json({ ok: false, error: "missing_service" }, { status: 400 });
    }
    
    return NextResponse.json(
      { ok: false, error: "server_error", detail },
      { status: 500 }
    );
  }
}
