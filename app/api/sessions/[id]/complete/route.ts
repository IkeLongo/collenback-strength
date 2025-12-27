// app/api/sessions/[id]/complete/route.ts
import { NextResponse } from "next/server";
import { withTx } from "@/app/lib/mysql";
import type { ResultSetHeader, RowDataPacket } from "mysql2/promise";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(_: Request, ctx: RouteContext) {
  const { id } = await ctx.params;
  const sessionId = Number(id);
  try {
    await withTx(async (conn) => {
      // Lock session
      const [rows] = await conn.execute<RowDataPacket[]>(
        `
        SELECT id, client_id, status, credit_id
        FROM sessions
        WHERE id = ?
        FOR UPDATE
        `,
        [sessionId]
      );
      if (rows.length === 0) {
        const err: any = new Error("Not found");
        err.code = "NOT_FOUND";
        throw err;
      }

      // Mark completed if scheduled (idempotent)
      await conn.execute<ResultSetHeader>(
        `
        UPDATE sessions
        SET status = 'completed', updated_at = NOW()
        WHERE id = ? AND status = 'scheduled'
        `,
        [sessionId]
      );

      // Insert consume only if not already consumed/released
      const [ins] = await conn.execute<ResultSetHeader>(
        `
        INSERT INTO credit_transactions
          (user_id, session_credit_id, session_id, payment_id, type, amount, note)
        SELECT
          s.client_id,
          s.credit_id,
          s.id,
          sc.payment_id,
          'consume',
          1,
          'Consumed reserved credit due to completion'
        FROM sessions s
        JOIN session_credits sc ON sc.id = s.credit_id
        WHERE s.id = ?
          AND s.credit_id IS NOT NULL
          AND NOT EXISTS (
            SELECT 1
            FROM credit_transactions ct
            WHERE ct.session_id = s.id
              AND ct.type IN ('consume','release')
          )
        `,
        [sessionId]
      );

      // Only move reserved -> used if consume inserted
      if (ins.affectedRows === 1) {
        await conn.execute<ResultSetHeader>(
          `
          UPDATE session_credits sc
          JOIN sessions s ON s.credit_id = sc.id
          SET sc.credits_reserved = GREATEST(sc.credits_reserved - 1, 0),
              sc.credits_used = sc.credits_used + 1
          WHERE s.id = ?
          `,
          [sessionId]
        );
      }
    });

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    if (e?.code === "NOT_FOUND") return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
    return NextResponse.json({ ok: false, error: "server_error", detail: e?.message }, { status: 500 });
  }
}
