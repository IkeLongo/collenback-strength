// app/client/profile/page.tsx
import { redirect } from "next/navigation";
import type { RowDataPacket } from "mysql2/promise";
import { pool } from "@/app/lib/mysql";

// Adjust this import to wherever you export auth from:
import { auth } from "@/app/actions/nextauth";

import ProfileAdmin from "./profileAdmin";

function avatarUrlFromKey(key: string | null) {
  const base = process.env.R2_PUBLIC_BASE_URL;
  if (!key || !base) return null;
  return `${base.replace(/\/$/, "")}/${key}`;
}

export default async function ProfilePage() {
  const session = await auth();
  const userId = session?.user?.id;

  // console.log("[SSR /client/profile] userId:", userId);

  if (!userId) {
    redirect("/auth"); // your login route
  }

  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT id, email, first_name, last_name, phone, avatar_key
     FROM users
     WHERE id = ? LIMIT 1`,
    [userId]
  );

  const u = rows[0] as any | undefined;

  // console.log("[SSR /client/profile] db user found:", !!u);

  if (!u) {
    redirect("/auth");
  }

  const initialProfile = {
    email: u.email as string,
    firstName: (u.first_name ?? "") as string,
    lastName: (u.last_name ?? "") as string,
    phone: (u.phone ?? "") as string,
    avatarKey: (u.avatar_key ?? null) as string | null,
    avatarUrl: avatarUrlFromKey(u.avatar_key ?? null),
  };

  return (
    <div className="p-6 max-w-2xl">
      <h1 className="text-xl! font-semibold! text-grey-700! normal-case!">My Profile</h1>
      <p className="text-sm! text-grey-500!">
        View, update, and manage your personal information.
      </p>
      <div className="mt-6">
        <ProfileAdmin initialProfile={initialProfile} />
      </div>
    </div>
  );
}