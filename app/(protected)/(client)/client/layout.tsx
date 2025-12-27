import { auth } from "@/app/actions/nextauth";
import { redirect } from "next/navigation";
import ClientDashboardShell from "./client-dashboard-shell";

export default async function ClientDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // Not logged in? send to auth (your route might be /auth or /get-started)
  if (!session?.user) redirect("/auth");

  // Optional role-gate
  if (session.user.role !== "client") redirect("/post-login");

  const userName =
    session.user.firstName && session.user.lastName
      ? `${session.user.firstName} ${session.user.lastName}`
      : session.user.firstName || "User";

  return <ClientDashboardShell userName={userName}>{children}</ClientDashboardShell>;
}
