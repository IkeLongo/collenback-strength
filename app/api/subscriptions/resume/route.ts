import Stripe from "stripe";
import { NextResponse } from "next/server";
import { auth } from "@/app/actions/nextauth";
import { pool } from "@/app/lib/mysql";
import type { RowDataPacket } from "mysql2/promise";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY_SB!, {
  apiVersion: "2025-11-17.clover",
});

export async function POST(req: Request) {
  try {
    const sessionAuth = await auth();
    const userId = sessionAuth?.user?.id;
    if (!userId) return NextResponse.json({ message: "Not authenticated" }, { status: 401 });

    const { subscription_id } = await req.json();
    const subRowId = Number(subscription_id);
    if (!subRowId) return NextResponse.json({ message: "Missing subscription_id" }, { status: 400 });

    const [rows] = await pool.execute<RowDataPacket[]>(
      `
      SELECT id, user_id, stripe_subscription_id, cancel_at_period_end
      FROM subscriptions
      WHERE id = ?
      LIMIT 1
      `,
      [subRowId]
    );

    const row: any = rows[0];
    if (!row) return NextResponse.json({ message: "Not found" }, { status: 404 });
    if (Number(row.user_id) !== Number(userId)) return NextResponse.json({ message: "Forbidden" }, { status: 403 });

    if (!row.stripe_subscription_id) {
      return NextResponse.json({ message: "Missing Stripe subscription id" }, { status: 400 });
    }

    // If it's already renewing, nothing to do
    if (!row.cancel_at_period_end) {
      return NextResponse.json({ ok: true, alreadyRenewing: true });
    }

    // ✅ Resume renewal
    await stripe.subscriptions.update(String(row.stripe_subscription_id), {
      cancel_at_period_end: false,
    });

    // Optional: optimistic DB update (webhook will confirm too)
    await pool.execute(
      `UPDATE subscriptions SET cancel_at_period_end = 0 WHERE id = ?`,
      [subRowId]
    );

    return NextResponse.json({ ok: true });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ message }, { status: 500 });
  }
}
