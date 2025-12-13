import Stripe from "stripe";
import { NextResponse } from "next/server";
import { fetchAllServices } from "@/sanity/lib/queries/services";
import { Service } from "@/app/types/types";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-11-17.clover",
});

type CartItem = { id: string; quantity: number };

export async function POST(req: Request) {
  try {
    const cartItems = (await req.json()) as CartItem[];
    const services = await fetchAllServices() as Service[];

    // build a fast lookup map from Sanity _id -> service
    const serviceById = new Map(services.map((s: any) => [s._id, s]));

    const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] =
      cartItems.map((item) => {
        const service = serviceById.get(item.id);
        if (!service) throw new Error(`Service ${item.id} not found in Sanity`);

        if (!service.priceCents || service.priceCents <= 0) {
          throw new Error(`Service ${item.id} has invalid priceCents`);
        }

        return {
          quantity: item.quantity,
          price_data: {
            currency: (service.currency || "USD").toLowerCase(),
            unit_amount: service.priceCents, // cents
            product_data: {
              name: service.title,
              description: service.shortDescription ?? undefined,
              metadata: { sanityId: service._id, category: service.category },
            },
          },
        };
      });

    const origin = req.headers.get("origin");
    if (!origin) throw new Error("Missing origin header");

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items,
      success_url: `${origin}/client/checkout/result?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}`,
    });

    return NextResponse.json({ id: session.id, url: session.url });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ statusCode: 500, message }, { status: 500 });
  }
}