// app/api/sessions/[id]/cancel/route.ts
import { NextResponse } from "next/server";
import { withTx } from "@/app/lib/mysql";
import type { ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { auth } from "@/app/actions/nextauth";

export async function POST(_: Request, { params }: { params: { id: string } }) {
  const sessionId = Number(params.id);

  const session = await auth();
  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  const clientId = Number(session.user.id);

  try {
    await withTx(async (conn) => {
      // Lock session
      const [rows] = await conn.execute<RowDataPacket[]>(
        `
        SELECT id, client_id, status, credit_id
        FROM sessions
        WHERE id = ? AND client_id = ?
        FOR UPDATE
        `,
        [sessionId, clientId]
      );
      if (rows.length === 0) {
        const err: any = new Error("Not found");
        err.code = "NOT_FOUND";
        throw err;
      }

      // Mark cancelled if scheduled (idempotent)
      await conn.execute<ResultSetHeader>(
        `
        UPDATE sessions
        SET status = 'cancelled', cancelled_at = NOW(), updated_at = NOW()
        WHERE id = ? AND client_id = ? AND status = 'scheduled'
        `,
        [sessionId, clientId]
      );

      // Insert release only if not already released/consumed
      // NOTE: Your unique index (session_id, type) also protects duplicates.
      const [ins] = await conn.execute<ResultSetHeader>(
        `
        INSERT INTO credit_transactions
          (user_id, session_credit_id, session_id, payment_id, type, amount, note)
        SELECT
          s.client_id,
          s.credit_id,
          s.id,
          sc.payment_id,
          'release',
          1,
          'Released reserved credit due to cancellation'
        FROM sessions s
        JOIN session_credits sc ON sc.id = s.credit_id
        WHERE s.id = ?
          AND s.client_id = ?
          AND s.credit_id IS NOT NULL
          AND NOT EXISTS (
            SELECT 1
            FROM credit_transactions ct
            WHERE ct.session_id = s.id
              AND ct.type IN ('release','consume')
          )
        `,
        [sessionId, clientId]
      );

      // Only decrement reserved if we actually inserted a release row
      if (ins.affectedRows === 1) {
        await conn.execute<ResultSetHeader>(
          `
          UPDATE session_credits sc
          JOIN sessions s ON s.credit_id = sc.id
          SET sc.credits_reserved = GREATEST(sc.credits_reserved - 1, 0)
          WHERE s.id = ? AND s.client_id = ?
          `,
          [sessionId, clientId]
        );
      }
    });

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    if (e?.code === "NOT_FOUND") return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
    return NextResponse.json({ ok: false, error: "server_error", detail: e?.message }, { status: 500 });
  }
}
