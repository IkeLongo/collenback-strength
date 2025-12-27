import Stripe from "stripe";
import { NextResponse } from "next/server";

type RouteContext = {
  params: Promise<{ id: string }>;
};

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-11-17.clover",
});

export async function GET(_req: Request, ctx: RouteContext) {
  const { id } = await ctx.params; // ✅ await params

  try {
    const session = await stripe.checkout.sessions.retrieve(id, {
      expand: ["payment_intent", "payment_intent.charges"],
    });

    return NextResponse.json(session);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ statusCode: 500, message }, { status: 500 });
  }
}