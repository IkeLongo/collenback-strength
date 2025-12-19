import { NextResponse } from "next/server";
import { auth } from "@/app/actions/nextauth";
import { pool } from "@/app/lib/mysql";
import { client } from "@/sanity/lib/client";

export const runtime = "nodejs";

type Params = {
  params: { entitlementId: string };
};

export async function GET(req: Request, { params }: Params) {
  // 1️⃣ Require auth
  const session = await auth();
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const userId = Number(session.user.id);
  const entitlementId = Number(params.entitlementId);

  if (!Number.isFinite(entitlementId)) {
    return new NextResponse("Invalid entitlement id", { status: 400 });
  }

  const conn = await pool.getConnection();

  try {
    // 2️⃣ Load entitlement (ownership check)
    const [rows] = await conn.query<any[]>(
      `
      SELECT
        pe.id,
        pe.sanity_file_asset_ref,
        pe.program_version,
        pi.service_title
      FROM program_entitlements pe
      JOIN payment_items pi ON pi.id = pe.payment_item_id
      WHERE pe.id = ?
        AND pe.user_id = ?
        AND pe.status = 'active'
      LIMIT 1
      `,
      [entitlementId, userId]
    );

    if (!rows.length) {
      return new NextResponse("Not found", { status: 404 });
    }

    const entitlement = rows[0];
    const assetRef = entitlement.sanity_file_asset_ref as string;

    // 3️⃣ Fetch file asset info from Sanity
    const asset = await client.fetch<{
      url: string;
      originalFilename?: string;
      mimeType?: string;
    }>(
      `
      *[_type == "sanity.fileAsset" && _id == $id][0]{
        url,
        originalFilename,
        mimeType
      }
      `,
      { id: assetRef }
    );

    if (!asset?.url) {
      return new NextResponse("File not found", { status: 404 });
    }

    // 4️⃣ Stream file from Sanity CDN
    const res = await fetch(asset.url);
    if (!res.ok || !res.body) {
      return new NextResponse("Failed to fetch file", { status: 500 });
    }

    const filename =
      asset.originalFilename ||
      `${entitlement.service_title ?? "program"}.pdf`;

    // 5️⃣ Return streamed response
    return new NextResponse(res.body, {
      headers: {
        "Content-Type": asset.mimeType || "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "private, no-store",
      },
    });
  } finally {
    conn.release();
  }
}
