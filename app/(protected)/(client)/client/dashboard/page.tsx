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
        <h1 className="text-xl! sm:text-2xl! font-bold! text-grey-600!">Welcome back, {userName}!</h1>
        <p className="text-grey-500! text-sm! sm:text-base!">
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