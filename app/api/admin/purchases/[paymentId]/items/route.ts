import { NextResponse } from "next/server";
import { pool } from "@/app/lib/mysql";
import type { RowDataPacket } from "mysql2/promise";
import { auth } from "@/app/actions/nextauth";
import { getServicesByIds } from "@/sanity/lib/queries/getServiceByIds";

// map sanity enum -> display title (matches your schema list)
function categoryTitleFromValue(v: string | null) {
  switch (v) {
    case "in_person": return "In-Person Coaching";
    case "online": return "Online Coaching";
    case "program": return "Strength Program";
    case "nutrition": return "Nutrition Coaching";
    default: return null;
  }
}

export async function GET(
  req: Request,
  { params }: { params: { paymentId: string } }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }

  const paymentId = Number(params.paymentId);
  if (!paymentId || Number.isNaN(paymentId)) {
    return NextResponse.json({ ok: false, message: "Invalid paymentId" }, { status: 400 });
  }

  try {
    // items
    const [rows] = await pool.query<RowDataPacket[]>(
      `
      SELECT
        pi.id,
        pi.payment_id,
        pi.sanity_service_id,
        pi.sanity_service_slug,
        pi.service_title,
        pi.service_category,
        pi.quantity,
        pi.unit_amount_cents,
        pi.amount_cents,
        pi.currency,
        pi.sessions_purchased,
        pi.created_at
      FROM payment_items pi
      WHERE pi.payment_id = ?
      ORDER BY pi.id ASC
      `,
      [paymentId]
    );

    // Optional: enrich category/title from Sanity (recommended for consistent display)
    const sanityIds = Array.from(
      new Set(
        rows
          .map((r: any) => r.sanity_service_id)
          .filter((id: any) => typeof id === "string" && id.length > 0)
      )
    ) as string[];

    let byId: Record<string, { title: string | null; category: string | null }> = {};
    if (sanityIds.length) {
      const services = await getServicesByIds(sanityIds);
      byId = Object.fromEntries(
        (services ?? []).map((s) => [
          s._id,
          { title: s.title ?? null, category: s.category ?? null },
        ])
      );
    }

    const items = rows.map((r: any) => {
      const meta = r.sanity_service_id ? byId[String(r.sanity_service_id)] : null;

      const categoryValue = meta?.category ?? r.service_category ?? null;
      const categoryTitle = categoryTitleFromValue(categoryValue);

      return {
        id: r.id,
        payment_id: r.payment_id,
        sanity_service_id: r.sanity_service_id ?? null,
        sanity_service_slug: r.sanity_service_slug ?? null,

        // Prefer Sanity title, fallback to stored snapshot
        service_title: meta?.title ?? r.service_title ?? null,

        // Value + title for UI
        service_category: categoryValue,
        service_category_title: categoryTitle,

        quantity: r.quantity,
        unit_amount_cents: r.unit_amount_cents,
        amount_cents: r.amount_cents,
        currency: r.currency,
        sessions_purchased: r.sessions_purchased ?? null,

        created_at: r.created_at,
      };
    });

    // Optional: subscription details (only if you want to display in dropdown)
    const [pRows] = await pool.query<RowDataPacket[]>(
      `SELECT subscription_id FROM payments WHERE id = ? LIMIT 1`,
      [paymentId]
    );
    const subscriptionId = pRows?.[0]?.subscription_id ?? null;

    let subscription: any = null;
    if (subscriptionId) {
      const [sRows] = await pool.query<RowDataPacket[]>(
        `
        SELECT
          id, status, current_period_start, current_period_end, cancel_at_period_end,
          stripe_customer_id, stripe_subscription_id
        FROM subscriptions
        WHERE id = ?
        LIMIT 1
        `,
        [subscriptionId]
      );
      subscription = sRows?.[0] ?? null;
    }

    return NextResponse.json({ ok: true, paymentId, items, subscription });
  } catch (e) {
    // console.error("GET /api/admin/purchases/:id/items error:", e);
    return NextResponse.json({ ok: false, message: "Failed to load line items." }, { status: 500 });
  }
}
