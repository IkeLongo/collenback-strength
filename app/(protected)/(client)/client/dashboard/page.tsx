import { auth } from "@/app/actions/nextauth";
import { getClientDashboardEntitlements } from "@/app/lib/queries/client-dashboard-entitlements";
import CategoryTabs from "@/app/ui/dashboard/category-tabs";
import CategoryTabsMobile from "@/app/ui/dashboard/category-tabs-mobile";

export default async function ClientDashboard() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const userName = session.user.firstName ? `${session.user.firstName}` : "User";
  const userId = Number(session.user.id);

  const data = await getClientDashboardEntitlements(userId);

  return (
    <div className="space-y-6!">
      <div>
        <h1 className="text-xl! font-semibold! text-grey-700! normal-case!">Welcome back, {userName}!</h1>
        <p className="text-sm! text-grey-500!">
          Browse your services by category, then by type.
        </p>
      </div>
      {/* tablet & smaller */}
      <div className="lg:hidden">
        <CategoryTabsMobile items={data.lineItems} title="Your Services" initialCategory="in_person" />
      </div>

      {/* desktop */}
      <div className="hidden lg:block">
        <CategoryTabs items={data.lineItems} title="Your Services" initialCategory="in_person" />
      </div>
    </div>
  );
}