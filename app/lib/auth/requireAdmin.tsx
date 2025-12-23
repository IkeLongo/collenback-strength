import { auth } from "@/app/actions/nextauth";

export async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id) return { ok: false as const, session: null };

  const u: any = session.user;
  const role = u?.role;
  const roleIds: number[] = u?.roleIds ?? [];
  const isAdmin = u?.isAdmin === true || role === "admin" || roleIds.includes(3);

  if (!isAdmin) return { ok: false as const, session };

  return { ok: true as const, session };
}
