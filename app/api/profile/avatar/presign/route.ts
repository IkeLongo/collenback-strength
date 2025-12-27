import { NextResponse } from "next/server";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// Adjust this import if needed:
import { auth } from "@/app/actions/nextauth";

import { r2 } from "@/app/lib/r2";

function extFromMime(mime: string) {
  if (mime === "image/png") return "png";
  if (mime === "image/jpeg") return "jpg";
  if (mime === "image/webp") return "webp";
  return null;
}

export async function POST(req: Request) {
  const session = await auth();
  const userId = session?.user?.id;

  // console.log("[POST /api/profile/avatar/presign] userId:", userId);

  if (!userId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const body = (await req.json()) as { contentType?: string };
  const contentType = (body.contentType ?? "").trim();
  const ext = extFromMime(contentType);

  // console.log("[presign] contentType:", contentType, "ext:", ext);

  if (!ext) {
    return NextResponse.json(
      { message: "Only PNG, JPG, or WEBP images are allowed." },
      { status: 400 }
    );
  }

  const bucket = process.env.R2_BUCKET!;
  if (!bucket) return NextResponse.json({ message: "Missing R2_BUCKET env var." }, { status: 500 });

  const key = `avatars/user_${userId}_${Date.now()}.${ext}`;

  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    ContentType: contentType,
    CacheControl: "public, max-age=31536000, immutable",
  });

  const uploadUrl = await getSignedUrl(r2, command, { expiresIn: 60 });

  // console.log("[presign] generated key:", key);
  // console.log("[presign] url length:", uploadUrl.length);

  return NextResponse.json({ uploadUrl, key });
}
