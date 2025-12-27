import { redirect } from "next/navigation";
import AdminShell from "./admin-dashboard-shell";
import { auth } from "@/app/actions/nextauth";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // Not logged in
  if (!session?.user?.id) {
    redirect("/auth");
  }

  // Admin check: prefer isAdmin if you added it; fallback to role / roleIds
  const u: any = session.user;
  const role = u?.role;
  const roleIds: number[] = u?.roleIds ?? [];
  const isAdmin = u?.isAdmin === true || role === "admin" || roleIds.includes(3);

  if (!isAdmin) {
    // choose where non-admins should go
    if (role === "coach") redirect("/coach/dashboard");
    redirect("/client/dashboard");
  }

  return <AdminShell>{children}</AdminShell>;
}
