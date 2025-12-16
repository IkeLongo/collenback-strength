import { NextResponse } from "next/server";
import { auth } from "@/app/actions/nextauth";
import { getClientDashboardEntitlements } from "@/app/lib/queries/client-dashboard-entitlements";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return new Response("Unauthorized", { status: 401 });

  const userId = Number(session.user.id);
  const data = await getClientDashboardEntitlements(userId);

  return NextResponse.json({ userId, data });
}