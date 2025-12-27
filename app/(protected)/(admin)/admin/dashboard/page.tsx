// app/admin/dashboard/page.tsx
import { auth } from "@/app/actions/nextauth";
import AdminDashboard from "@/app/ui/admin/dashboard/admin-dashboard";
import { getAdminDashboardData } from "@/app/ui/admin/dashboard/dashboard-data";

export default async function AdminDashboardPage() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) return null;

  const data = await getAdminDashboardData(Number(userId));

  return <AdminDashboard data={data} />;
}