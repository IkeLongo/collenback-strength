// app/api/admin/purchases/route.ts
import { NextResponse } from "next/server";
import { getAdminPurchases } from "@/app/lib/auth/getPurchases";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const limit = searchParams.get("limit");
  const offset = searchParams.get("offset");
  const status = searchParams.get("status");
  const q = searchParams.get("q");

  const data = await getAdminPurchases({
    limit: limit ? Number(limit) : undefined,
    offset: offset ? Number(offset) : undefined,
    status,
    q,
  });

  if (!data.ok) {
    return NextResponse.json(
      { ok: false, message: (data as any).message ?? "Unauthorized" },
      { status: (data as any).status ?? 401 }
    );
  }

  return NextResponse.json(data);
}

