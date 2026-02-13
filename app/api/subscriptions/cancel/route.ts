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

    const body = await req.json();
    const subscriptionId = Number(body?.subscription_id);
    if (!subscriptionId) {
      return NextResponse.json({ message: "Missing subscription_id" }, { status: 400 });
    }

    // ✅ Verify this subscription belongs to the signed-in user
    const [rows] = await pool.execute<RowDataPacket[]>(
      `
      SELECT id, user_id, stripe_subscription_id, cancel_at_period_end, status
      FROM subscriptions
      WHERE id = ?
      LIMIT 1
      `,
      [subscriptionId]
    );

    const subRow = rows[0] as any;
    if (!subRow) return NextResponse.json({ message: "Subscription not found" }, { status: 404 });
    if (Number(subRow.user_id) !== Number(userId)) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }
    if (!subRow.stripe_subscription_id) {
      return NextResponse.json({ message: "Missing Stripe subscription id" }, { status: 400 });
    }

    // ✅ If already scheduled for cancel, just return ok (idempotent UX)
    if (subRow.cancel_at_period_end) {
      return NextResponse.json({ ok: true, alreadyScheduled: true });
    }

    // ✅ Schedule cancellation at period end
    await stripe.subscriptions.update(String(subRow.stripe_subscription_id), {
      cancel_at_period_end: true,
    });

    // Optional: optimistically update DB for instant UI feedback.
    // Your webhook (customer.subscription.updated) should also keep this in sync.
    await pool.execute(
      `
      UPDATE subscriptions
      SET cancel_at_period_end = 1
      WHERE id = ?
      `,
      [subscriptionId]
    );

    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ message }, { status: 500 });
  }
}
