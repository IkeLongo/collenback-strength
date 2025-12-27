import { NextResponse } from "next/server";
import crypto from "crypto";
import bcryptjs from "bcryptjs";
import {
  getValidPasswordResetTokenByHash,
  markPasswordResetTokenUsed,
  updateUserPasswordHash,
} from "@/app/lib/queries/passwordReset";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { token?: string; newPassword?: string };

    const token = (body.token ?? "").trim();
    const newPassword = body.newPassword ?? "";

    if (!token || !newPassword) {
      return NextResponse.json(
        { message: "Token and new password are required." },
        { status: 400 }
      );
    }

    // Minimum password rules (bare bones)
    if (newPassword.length < 8) {
      return NextResponse.json(
        { message: "Password must be at least 8 characters." },
        { status: 400 }
      );
    }

    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

    const tokenRow = await getValidPasswordResetTokenByHash(tokenHash);
    if (!tokenRow) {
      return NextResponse.json(
        { message: "Reset link is invalid or has expired." },
        { status: 400 }
      );
    }

    // Hash new password (bcrypt)
    const passwordHash = await bcryptjs.hash(newPassword, 12);

    await updateUserPasswordHash({
      userId: tokenRow.user_id,
      passwordHash,
    });

    await markPasswordResetTokenUsed(tokenRow.id);

    return NextResponse.json({ message: "Password reset successful." });
  } catch (error) {
    // console.error("Reset Password API Error:", error);
    return NextResponse.json(
      { message: "Internal server error during password reset." },
      { status: 500 }
    );
  }
}
