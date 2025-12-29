// app/lib/auth/requireAdmin.tsx

import { auth } from "@/app/actions/nextauth";

export async function requireAdmin() {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      ok: false as const,
      status: 401,
      message: "Unauthorized",
      session: null,
    };
  }

  const u: any = session.user;
  const role = u?.role;
  const roleIds: number[] = u?.roleIds ?? [];

  const isAdmin =
    u?.isAdmin === true ||
    role === "admin" ||
    roleIds.includes(3); // ✅ your admin role id

  if (!isAdmin) {
    return {
      ok: false as const,
      status: 403,
      message: "Forbidden",
      session,
    };
  }

  return {
    ok: true as const,
    session,
    userId: Number(u.id),       // ✅ IMPORTANT
    role,
    roleIds,
  };
}

