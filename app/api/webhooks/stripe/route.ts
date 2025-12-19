import Stripe from "stripe";
import { NextResponse } from "next/server";
import { pool } from "@/app/lib/mysql";

import { sendPurchaseConfirmationEmail } from "@/app/lib/email/sendPurchaseConfirmation";
import { sendAdminPurchaseNotificationEmail } from "@/app/lib/email/sendAdminPurchaseNotification";
import type { PurchaseLine } from "@/app/lib/email/sendPurchaseConfirmation";

export const runtime = "nodejs";

const DEBUG_WEBHOOK = true;

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-11-17.clover",
});

function inferKind(meta: Record<string, string | undefined>) {
  if (meta.service_category === "program") return "program" as const;
  if (meta.membership_interval) return "membership" as const;
  return "pack" as const;
}

function getSubscriptionPeriod(sub: Stripe.Subscription): {
  start: Date | null;
  end: Date | null;
} {
  // Some Stripe typings/versions put these on the subscription object
  const anySub = sub as any;

  const startUnix: number | undefined =
    anySub.current_period_start ?? sub.items?.data?.[0]?.current_period_start;

  const endUnix: number | undefined =
    anySub.current_period_end ?? sub.items?.data?.[0]?.current_period_end;

  return {
    start: typeof startUnix === "number" ? new Date(startUnix * 1000) : null,
    end: typeof endUnix === "number" ? new Date(endUnix * 1000) : null,
  };
}

/**
 * ✅ Keep subscriptions table in sync with Stripe lifecycle events.
 * Relies on your unique key: (provider, stripe_subscription_id)
 */
async function updateSubscriptionFromStripe(conn: any, sub: Stripe.Subscription) {
  const stripeSubId = sub.id;
  const stripeCustomerId =
    typeof sub.customer === "string" ? sub.customer : sub.customer?.id;

  const status = sub.status as any;
  const cancelAtPeriodEnd = sub.cancel_at_period_end ? 1 : 0;

  const { start: currentPeriodStart, end: currentPeriodEnd } = getSubscriptionPeriod(sub);

  await conn.query(
    `
    UPDATE subscriptions
    SET
      stripe_customer_id = COALESCE(stripe_customer_id, ?),
      status = ?,
      current_period_start = ?,
      current_period_end = ?,
      cancel_at_period_end = ?
    WHERE provider = 'stripe'
      AND stripe_subscription_id = ?
    `,
    [
      stripeCustomerId ?? null,
      status,
      currentPeriodStart,
      currentPeriodEnd,
      cancelAtPeriodEnd,
      stripeSubId,
    ]
  );
}

function getSubscriptionIdFromInvoice(inv: Stripe.Invoice): string | null {
  const anyInv = inv as any;

  // 1) Most subscription invoices: inv.subscription is a string
  const direct = anyInv.subscription;
  if (typeof direct === "string" && direct) return direct;

  // 2) Fallback: look for subscription id on invoice line items
  const lines = anyInv.lines?.data;
  if (Array.isArray(lines)) {
    for (const line of lines) {
      const s = line?.subscription;
      if (typeof s === "string" && s) return s;
      if (s && typeof s === "object" && typeof s.id === "string") return s.id;
    }
  }

  return null;
}

export async function POST(req: Request) {
  const sig = req.headers.get("stripe-signature");
  if (!sig) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  // ✅ raw body required for Stripe signature verification
  const body = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Invalid signature";
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  const conn = await pool.getConnection();

  try {
    /**
     * ✅ Handle subscription lifecycle events (status changes, cancel completion, etc.)
     * These happen long after checkout and are required to keep DB in sync.
     */
    if (
      event.type === "customer.subscription.updated" ||
      event.type === "customer.subscription.deleted"
    ) {
      const sub = event.data.object as Stripe.Subscription;
      const { start: periodStart, end: periodEnd } = getSubscriptionPeriod(sub);

      if (DEBUG_WEBHOOK) {
        console.log("🔁 subscription lifecycle event:", event.type, {
          id: sub.id,
          status: sub.status,
          cancel_at_period_end: sub.cancel_at_period_end,
          current_period_end: periodEnd,
        });
      }

      await updateSubscriptionFromStripe(conn, sub);
      return NextResponse.json({ received: true });
    }

    /**
     * ✅ (Optional but useful) Keep statuses accurate if payments fail/recover.
     * Requires your subscriptions table to already have stripe_subscription_id.
     */
    if (
      event.type === "invoice.payment_failed" ||
      event.type === "invoice.paid"
    ) {
      const inv = event.data.object as Stripe.Invoice;

      const subId = getSubscriptionIdFromInvoice(inv);

      if (subId) {
        const sub = await stripe.subscriptions.retrieve(subId);
        await updateSubscriptionFromStripe(conn, sub);
      } else {
        if (DEBUG_WEBHOOK) console.log("🧾 invoice event has no subscription; skipping", {
          invoice: inv.id,
          billing_reason: (inv as any).billing_reason,
        });
      }
      return NextResponse.json({ received: true });
    }

    /**
     * ✅ Checkout completion (your existing logic)
     */
    if (event.type !== "checkout.session.completed") {
      return NextResponse.json({ received: true });
    }

    const session = event.data.object as Stripe.Checkout.Session;

    // Pull full session details (IMPORTANT: expand subscription)
    const full = await stripe.checkout.sessions.retrieve(session.id, {
      expand: ["line_items.data.price.product", "payment_intent", "subscription"],
    });

    if (DEBUG_WEBHOOK) {
      console.log("🔔 checkout.session.completed received");
      console.log("Session ID:", full.id);
      console.log("Mode:", full.mode);
      console.log("Payment Status:", full.payment_status);
      console.log("Amount Total:", full.amount_total);
      console.log("Currency:", full.currency);
      console.log("Subscription:", full.subscription);
    }

    // ✅ Resolve user_id from client_reference_id or metadata
    const userIdRaw = full.client_reference_id || full.metadata?.user_id;
    if (!userIdRaw) {
      return NextResponse.json({ error: "No user id on session" }, { status: 400 });
    }
    const userId = Number(userIdRaw);
    if (!Number.isFinite(userId)) {
      return NextResponse.json({ error: "Invalid user id on session" }, { status: 400 });
    }

    await conn.beginTransaction();

    // 1) Idempotency for payments: don’t process same Stripe event twice
    const [existingPayment] = await conn.query<any[]>(
      `SELECT id FROM payments WHERE provider = ? AND provider_event_id = ? LIMIT 1`,
      ["stripe", event.id]
    );

    if (existingPayment.length) {
      await conn.rollback();
      return NextResponse.json({ received: true });
    }

    // 2) Insert into payments table (works for one-time + subscription checkouts)
    const pi = full.payment_intent as Stripe.PaymentIntent | null;
    const status = full.payment_status === "paid" ? "succeeded" : "pending";
    const paidAt = full.created ? new Date(full.created * 1000) : null;

    if (DEBUG_WEBHOOK) {
      console.log("💳 Payment Record Preview:", {
        user_id: userId,
        amount_cents: full.amount_total ?? 0,
        currency: full.currency ?? "usd",
        provider: "stripe",
        provider_session_id: full.id,
        provider_event_id: event.id,
        provider_payment_id: pi?.id ?? null,
        provider_customer_id: (full.customer as string) ?? null,
        status,
        paid_at: paidAt,
      });
    }

    const [payRes] = await conn.query<any>(
      `INSERT INTO payments
        (user_id, amount_cents, currency, provider, provider_session_id, provider_event_id,
         provider_payment_id, provider_customer_id, status, paid_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        full.amount_total ?? 0,
        full.currency ?? "usd",
        "stripe",
        full.id,
        event.id,
        pi?.id ?? null,
        (full.customer as string) ?? null,
        status,
        paidAt,
      ]
    );

    const paymentId = payRes.insertId as number;

    // 3) If this checkout created a Stripe subscription, insert into subscriptions table
    let sub: Stripe.Subscription | null = null;
    let stripeSubscriptionId: string | null = null;
    let periodStart: Date | null = null;
    let periodEnd: Date | null = null;

    if (typeof full.subscription === "string") {
      stripeSubscriptionId = full.subscription;
    } else if (full.subscription && typeof full.subscription === "object" && full.subscription.id) {
      stripeSubscriptionId = full.subscription.id;
    }

    if (stripeSubscriptionId) {
      sub = await stripe.subscriptions.retrieve(stripeSubscriptionId);

      const plan = sub.items.data[0]?.plan;
      if (DEBUG_WEBHOOK) {
        console.log("🧾 Stripe Subscription:", {
          id: sub.id,
          customer: sub.customer,
          status: sub.status,
          current_period_start: periodStart,
          current_period_end: periodEnd,
          plan_interval: plan?.interval,
          plan_interval_count: plan?.interval_count,
          cancel_at_period_end: sub.cancel_at_period_end,
        });
      }
    }

    // 4) Insert payment_items + session_credits + subscriptions-per-service (if membership)
    const lineItems = full.line_items?.data ?? [];
    const emailLines: PurchaseLine[] = [];

    for (const li of lineItems) {
      const quantity = li.quantity ?? 1;
      const price = li.price;
      const product = (price?.product as Stripe.Product) || null;

      if (DEBUG_WEBHOOK) {
        console.log("Stripe Product metadata:", product?.metadata);
      }

      const sanityServiceId = product?.metadata?.sanity_service_id || null;
      const sanityServiceSlug = product?.metadata?.sanity_service_slug || null;
      const category = product?.metadata?.service_category || null;

      const isProgramLineItem = category === "program";
      const programPdfAssetRef = product?.metadata?.program_pdf_asset_ref || null;
      const programVersion = product?.metadata?.program_version || null;
      const programNotesSnapshot = product?.metadata?.program_notes_snapshot || null;
      const coverImageUrlSnapshot = product?.metadata?.program_cover_image_url_snapshot || null;
      const coverImageAltSnapshot = product?.metadata?.program_cover_image_alt_snapshot || null;

      // packs use this; memberships usually have 0 here
      const sessionsIncluded = Number(product?.metadata?.sessions_included ?? 0);

      // membership metadata flags
      const membershipInterval = product?.metadata?.membership_interval || null;

      const unitAmount = price?.unit_amount ?? 0;
      const currency = price?.currency ?? full.currency ?? "usd";
      const title = product?.name ?? "Service";

      const amountCents = unitAmount * quantity;
      const sessionsPurchased = sessionsIncluded ? sessionsIncluded * quantity : null;

      const meta = (product?.metadata ?? {}) as Record<string, string | undefined>;
      const kind = inferKind(meta);

      emailLines.push({
        title,
        category,
        kind,
        quantity,
        unitAmountCents: unitAmount,
        amountCents,
        meta: {
          sessionsPurchased,
          membershipInterval: meta.membership_interval ?? null,
          membershipIntervalCount: meta.membership_interval_count
            ? Number(meta.membership_interval_count)
            : null,
          programVersion: programVersion ?? null,
        },
      });

      if (DEBUG_WEBHOOK) {
        console.log("📦 Line Item Preview:", {
          sanity_service_id: sanityServiceId,
          sanity_service_slug: sanityServiceSlug,
          service_title: title,
          service_category: category,
          quantity,
          unit_amount_cents: unitAmount,
          amount_cents: amountCents,
          currency,
          sessions_purchased: sessionsPurchased,
          stripe_price_id: price?.id,
        });
      }

      // 4a) payment_items insert (always)
      const [itemRes] = await conn.query<any>(
        `INSERT INTO payment_items
          (payment_id, sanity_service_id, sanity_service_slug, service_title, service_category,
           quantity, unit_amount_cents, amount_cents, currency, sessions_purchased)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          paymentId,
          sanityServiceId,
          sanityServiceSlug,
          title,
          category,
          quantity,
          unitAmount,
          amountCents,
          currency,
          sessionsPurchased,
        ]
      );

      const paymentItemId = itemRes.insertId as number;

      if (isProgramLineItem) {
        if (!sanityServiceId) throw new Error("Program line item missing sanity_service_id");
        if (!programPdfAssetRef) {
          throw new Error(
            `Program line item missing program_pdf_asset_ref metadata (cannot version-lock purchase).`
          );
        }

        await conn.query(
          `INSERT INTO program_entitlements
            (user_id, payment_id, payment_item_id, sanity_service_id, sanity_service_slug,
             sanity_file_asset_ref, program_version,
             program_notes_snapshot, cover_image_url_snapshot, cover_image_alt_snapshot,
             status)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')`,
          [
            userId,
            paymentId,
            paymentItemId,
            sanityServiceId,
            sanityServiceSlug,
            programPdfAssetRef,
            programVersion,
            programNotesSnapshot,
            coverImageUrlSnapshot,
            coverImageAltSnapshot,
          ]
        );
      }

      // 4b) session_credits insert (packs)
      const totalCredits = sessionsIncluded * quantity;
      if (!isProgramLineItem && totalCredits > 0) {
        await conn.query(
          `INSERT INTO session_credits
            (user_id, payment_id, payment_item_id, sanity_service_id, sanity_service_slug,
             total_credits, credits_used, expires_at)
           VALUES (?, ?, ?, ?, ?, ?, 0, NULL)`,
          [userId, paymentId, paymentItemId, sanityServiceId, sanityServiceSlug, totalCredits]
        );
      }

      // 4c) subscriptions insert (memberships)
      // membership if it has membership_interval metadata AND we have a Stripe subscription.
      const isMembershipLineItem = Boolean(membershipInterval);

      if (isMembershipLineItem && sub && sanityServiceId) {
        // ✅ Use Stripe-provided timestamps (authoritative)
        const { start: periodStart, end: periodEnd } = getSubscriptionPeriod(sub);

        const cancelAtPeriodEnd = sub.cancel_at_period_end ? 1 : 0;

        // ✅ Idempotency for subscriptions: prevent duplicates on webhook retries
        const [existingSub] = await conn.query<any[]>(
          `SELECT id
           FROM subscriptions
           WHERE provider = ? AND stripe_checkout_session_id = ? AND sanity_service_id = ?
           LIMIT 1`,
          ["stripe", full.id, sanityServiceId]
        );

        if (!existingSub.length) {
          if (DEBUG_WEBHOOK) {
            console.log("🧾 Subscriptions Row Preview:", {
              user_id: userId,
              sanity_service_id: sanityServiceId,
              sanity_service_slug: sanityServiceSlug,
              provider: "stripe",
              stripe_customer_id: String(sub.customer),
              stripe_subscription_id: sub.id,
              stripe_checkout_session_id: full.id,
              status: sub.status,
              current_period_start: periodStart,
              current_period_end: periodEnd,
              cancel_at_period_end: cancelAtPeriodEnd,
            });
          }

          await conn.query(
            `INSERT INTO subscriptions
              (user_id, sanity_service_id, sanity_service_slug, provider,
               stripe_customer_id, stripe_subscription_id, stripe_checkout_session_id,
               status, current_period_start, current_period_end, cancel_at_period_end)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              userId,
              sanityServiceId,
              sanityServiceSlug,
              "stripe",
              String(sub.customer),
              sub.id,
              full.id,
              sub.status,
              periodStart,
              periodEnd,
              cancelAtPeriodEnd,
            ]
          );
        } else {
          // ✅ Optional: on checkout completion, also ensure our row reflects latest Stripe state
          await updateSubscriptionFromStripe(conn, sub);
        }
      }
    }

    await conn.commit();

    // ✅ fetch buyer info (webhook has no auth session)
    let buyer:
      | { email: string | null; first_name: string | null; last_name: string | null; phone: string | null }
      | null = null;

    try {
      const [urows] = await conn.query<any[]>(
        `SELECT email, first_name, last_name, phone FROM users WHERE id = ? LIMIT 1`,
        [userId]
      );
      buyer = urows?.[0] ?? null;
    } catch (e) {
      console.error("[webhook] user lookup failed", e);
    }

    // ✅ build URLs + recipients
    const dashboardUrl =
      process.env.APP_BASE_URL
        ? `${process.env.APP_BASE_URL}/client/dashboard`
        : "https://collenbackstrength.com/client/dashboard";

    const adminTo = process.env.ADMIN_NOTIFY_EMAIL || "";

    // ✅ send emails best-effort (do NOT block Stripe)
    queueMicrotask(async () => {
      try {
        if (buyer?.email) {
          await sendPurchaseConfirmationEmail({
            to: buyer.email,
            firstName: buyer.first_name ?? undefined,
            lastName: buyer.last_name ?? undefined,
            paymentId,
            totalCents: full.amount_total ?? 0,
            currency: full.currency ?? "usd",
            lines: emailLines,
            dashboardUrl,
          });
        } else {
          console.warn("[webhook] no buyer email, skipping purchase confirmation", { userId });
        }
      } catch (e) {
        console.error("[webhook] purchase confirmation email failed", e);
      }

      try {
        if (adminTo) {
          await sendAdminPurchaseNotificationEmail({
            to: adminTo,
            paymentId,
            totalCents: full.amount_total ?? 0,
            currency: full.currency ?? "usd",
            client: {
              userId,
              name: [buyer?.first_name, buyer?.last_name].filter(Boolean).join(" ") || null,
              email: buyer?.email ?? null,
              phone: buyer?.phone ?? null,
            },
            lines: emailLines,
          });
        } else {
          console.warn("[webhook] ADMIN_NOTIFY_EMAIL missing; skipping admin notification");
        }
      } catch (e) {
        console.error("[webhook] admin purchase notification failed", e);
      }
    });

    return NextResponse.json({ received: true });
  } catch (err) {
    try {
      // Only rollback if a transaction began (checkout flow)
      await conn.query("ROLLBACK");
    } catch {}
    const msg = err instanceof Error ? err.message : "Webhook handler error";
    console.error("Webhook error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  } finally {
    conn.release();
  }
}