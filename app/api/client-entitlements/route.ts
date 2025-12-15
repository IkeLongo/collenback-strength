import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/actions/nextauth";
import { getClientEntitlements } from "@/app/lib/queries/client-entitlements";

export async function GET(req: NextRequest) {
  const session = await auth();
  const userId = Number(session?.user?.id);
  if (!userId) return NextResponse.json([], { status: 401 });

  const entitlements = await getClientEntitlements(userId);
  // Only return services with a title and id/slug
  const services = entitlements
    .filter(e => e.service_title && (e.sanity_service_id || e.sanity_service_slug))
    .map(e => ({
      id: e.sanity_service_id || e.sanity_service_slug,
      title: e.service_title,
      category: e.service_category,
      total_credits: e.total_credits,
      credits_used: e.credits_used,
    }));
  return NextResponse.json(services);
}
