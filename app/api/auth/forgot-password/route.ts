import { NextResponse } from "next/server";
import crypto from "crypto";
import { getUserByEmailWithRole } from "@/app/lib/queries/users";
import { createPasswordResetToken } from "@/app/lib/queries/passwordReset";
import { sendResetEmail } from "@/app/lib/email/sendResetEmail";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { email?: string };
    const email = (body.email ?? "").trim().toLowerCase();

    // Return generic success no matter what (prevents user enumeration)
    const genericOk = NextResponse.json({
      message: "If an account exists for that email, a reset link has been sent.",
    });

    if (!email) return NextResponse.json({ message: "Email is required." }, { status: 400 });

    // Look up user
    const users = await getUserByEmailWithRole(email);
    if (users.length === 0) return genericOk;

    const user = users[0];

    // (Optional) block inactive users
    // if (user.is_active === 0) return genericOk;

    // Create raw token (what goes in the URL)
    const rawToken = crypto.randomBytes(32).toString("hex"); // 64 chars
    const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");

    // Expiry window: 30 minutes (choose your preference)
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

    await createPasswordResetToken({
      userId: user.id,
      tokenHash,
      expiresAt,
    });

    const baseUrl =
      process.env.NEXT_PUBLIC_SITE_URL ||
      process.env.NEXTAUTH_URL ||
      "http://localhost:3000";

    const resetUrl = `${baseUrl}/reset-password?token=${rawToken}`;

    await sendResetEmail({
      to: user.email,
      resetUrl,
      firstName: user.first_name,
      brandName: "Collenback Strength",
    });

    return genericOk;
  } catch (error) {
    console.error("Forgot Password API Error:", error);
    return NextResponse.json(
      { message: "Internal server error during forgot password." },
      { status: 500 }
    );
  }
}
