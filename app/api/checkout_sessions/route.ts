import Stripe from "stripe";
import { NextResponse } from "next/server";
import { fetchAllServices } from "@/sanity/lib/queries/services";
import { Service } from "@/app/types/types";
import { auth } from "@/app/actions/nextauth";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-11-17.clover",
});

type CartItem = { id: string; quantity: number };

export async function POST(req: Request) {
  try {
    // ✅ Require auth
    const sessionAuth = await auth();
    const userId = sessionAuth?.user?.id;

    if (!userId) {
      return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
    }

    const origin = req.headers.get("origin");
    if (!origin) throw new Error("Missing origin header");

    const cartItems = (await req.json()) as CartItem[];
    if (!Array.isArray(cartItems) || cartItems.length === 0) {
      return NextResponse.json({ message: "Cart is empty" }, { status: 400 });
    }

    const services = (await fetchAllServices()) as Service[];
    const serviceById = new Map(services.map((s: any) => [s._id, s]));

    // ✅ Prevent mixing membership + one-time items in the same checkout
    const pricingModels = new Set<string>();
    for (const item of cartItems) {
      const svc = serviceById.get(item.id);
      if (!svc) throw new Error(`Service ${item.id} not found in Sanity`);
      pricingModels.add((svc as any).pricingModel || "one_time");
    }

    if (pricingModels.size > 1) {
      return NextResponse.json(
        { message: "You can’t mix membership + one-time items in the same checkout." },
        { status: 400 }
      );
    }

    const isMembershipCart = pricingModels.has("membership");

    const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = cartItems.map((item) => {
      const service: any = serviceById.get(item.id);
      if (!service) throw new Error(`Service ${item.id} not found in Sanity`);

      if (!service.priceCents || service.priceCents <= 0) {
        throw new Error(`Service ${item.id} has invalid priceCents`);
      }

      const quantity = item.quantity ?? 1;

      const baseMetadata: Record<string, string> = {
        sanity_service_id: service._id,
        sanity_service_slug: service.slug?.current ?? "",
        service_category: service.category ?? "",
        sessions_included: String(service.sessionsIncluded ?? 0),
      };

      const isProgram = service.category === "program";

      // ✅ PROGRAM METADATA (version-locked purchase + snapshots)
      if (isProgram) {
        const pdfAssetRef = service?.program?.pdf?.asset?._id; // from GROQ asset->_id
        const programVersion = service?.program?.version ?? "";
        const pdfFilename = service?.program?.pdf?.asset?.originalFilename ?? "";

        // Snapshots (optional, but we'll store per purchase)
        const notesSnapshot = service?.program?.notes ?? "";
        const coverImageUrlSnapshot = service?.program?.coverImageUrl ?? "";
        const coverImageAltSnapshot = service?.program?.coverImageAlt ?? "";

        if (!pdfAssetRef) {
          throw new Error(
            `Program "${service.title}" is missing program.pdf in Sanity (required to sell).`
          );
        }

        baseMetadata.program_pdf_asset_ref = String(pdfAssetRef);
        baseMetadata.program_version = String(programVersion);
        baseMetadata.program_pdf_filename = String(pdfFilename);

        // ✅ NEW: snapshot metadata (so future Sanity edits don't affect prior purchases)
        // Keep these reasonably short due to Stripe metadata size limits.
        baseMetadata.program_notes_snapshot = String(notesSnapshot).slice(0, 900);
        baseMetadata.program_cover_image_url_snapshot = String(coverImageUrlSnapshot).slice(0, 1800);
        baseMetadata.program_cover_image_alt_snapshot = String(coverImageAltSnapshot).slice(0, 200);
      }

      // ✅ MEMBERSHIP: recurring price_data (no Stripe dashboard Price needed)
      if (service.pricingModel === "membership") {
        const m = service.membership || {};

        // Stripe supports: "day" | "week" | "month" | "year"
        const interval =
          (m.interval || "month") as Stripe.Price.Recurring.Interval;

        const interval_count = Number(m.intervalCount || 1);

        return {
          quantity,
          price_data: {
            currency: (service.currency || "USD").toLowerCase(),
            unit_amount: service.priceCents,
            recurring: { interval, interval_count },
            product_data: {
              name: service.title,
              description: service.shortDescription ?? undefined,
              metadata: {
                ...baseMetadata,
                membership_interval: String(interval),
                membership_interval_count: String(interval_count),
                membership_auto_renew: String(m.autoRenew ?? true),
                membership_duration_days:
                  m.durationDays != null ? String(m.durationDays) : "",
                membership_sessions_per_period:
                  m.sessionsPerPeriod != null ? String(m.sessionsPerPeriod) : "",
              },
            },
          },
        };
      }

      // ✅ ONE-TIME: normal price_data
      return {
        quantity,
        price_data: {
          currency: (service.currency || "USD").toLowerCase(),
          unit_amount: service.priceCents,
          product_data: {
            name: service.title,
            description: service.shortDescription ?? undefined,
            metadata: baseMetadata,
          },
        },
      };
    });

    const sessionStripe = await stripe.checkout.sessions.create({
      mode: isMembershipCart ? "subscription" : "payment",
      line_items,

      // ✅ identify the buyer for your webhook DB writes
      client_reference_id: String(userId),
      metadata: { user_id: String(userId) },

      success_url: `${origin}/client/checkout/result?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}`,
    });

    return NextResponse.json({ id: sessionStripe.id, url: sessionStripe.url });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ statusCode: 500, message }, { status: 500 });
  }
}
