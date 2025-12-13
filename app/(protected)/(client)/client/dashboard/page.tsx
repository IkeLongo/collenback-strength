import { auth } from "@/app/actions/nextauth";
import { getClientEntitlements } from "@/app/lib/queries/client-entitlements";

function formatDate(d: Date) {
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

export default async function ClientDashboard() {
  const session = await auth();
  const userName = session?.user?.firstName ? `${session.user.firstName}` : "User";
  const userId = Number(session?.user?.id);


  const entitlementsRaw = Number.isFinite(userId) ? await getClientEntitlements(userId) : [];

  // Group entitlements by service (using sanity_service_id or slug as key)
  const entitlementsMap = new Map<string, typeof entitlementsRaw[0]>();
  for (const e of entitlementsRaw) {
    // Use id if present, else slug, else title+category as fallback
    const key = e.sanity_service_id || e.sanity_service_slug || `${e.service_title ?? ''}|${e.service_category ?? ''}`;
    if (entitlementsMap.has(key)) {
      const existing = entitlementsMap.get(key)!;
      existing.total_credits += e.total_credits;
      existing.credits_used += e.credits_used;
      // For memberships, keep the latest expiry
      if (existing.expires_at && e.expires_at) {
        existing.expires_at = existing.expires_at > e.expires_at ? existing.expires_at : e.expires_at;
      } else if (e.expires_at) {
        existing.expires_at = e.expires_at;
      }
    } else {
      entitlementsMap.set(key, { ...e });
    }
  }
  const entitlements = Array.from(entitlementsMap.values());

  // quick stats (derived)
  const totalRemainingSessions = entitlements.reduce((acc, e) => {
    const remaining = Math.max(0, (e.total_credits ?? 0) - (e.credits_used ?? 0));
    return acc + remaining;
  }, 0);

  const activeMemberships = entitlements.filter((e) => e.expires_at && (e.total_credits === 0 || e.total_credits === 1));
  const nextExpiringMembership = activeMemberships
    .slice()
    .sort((a, b) => (a.expires_at!.getTime() - b.expires_at!.getTime()))[0];

  // Helper to format category for display
  function formatCategory(cat: string | null) {
    if (!cat) return "Service";
    return cat
      .replace(/_/g, " ")
      .replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1));
  }

  return (
    <div className="space-y-6!">
      {/* Header */}
      <div>
        <h1 className="text-xl! sm:text-2xl! font-bold! text-grey-600!">
          Welcome back, {userName}!
        </h1>
        <p className="text-grey-500! text-sm! sm:text-base!">
          Your purchases, remaining sessions, and active access.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3! sm:gap-4! md:gap-6!">
        <div className="bg-white! p-4! sm:p-6! rounded-2xl! border border-grey-200 shadow-sm">
          <h3 className="text-base! sm:text-lg! font-bold! text-grey-700! tracking-wide!">
            Sessions Remaining
          </h3>
          <p className="text-2xl! sm:text-3xl! font-extrabold! text-gold-600! mt-2!">
            {totalRemainingSessions}
          </p>
          <p className="text-xs! sm:text-sm! text-grey-500!">Across all session packs</p>
        </div>

        <div className="bg-white! p-4! sm:p-6! rounded-2xl! border border-grey-200 shadow-sm">
          <h3 className="text-base! sm:text-lg! font-bold! text-grey-700! tracking-wide!">
            Active Memberships
          </h3>
          <p className="text-2xl! sm:text-3xl! font-extrabold! text-gold-600! mt-2!">
            {activeMemberships.length}
          </p>
          <p className="text-xs! sm:text-sm! text-grey-500!">
            {nextExpiringMembership?.expires_at
              ? `Next renewal/expiry: ${formatDate(nextExpiringMembership.expires_at)}`
              : "No active memberships"}
          </p>
        </div>

        <div className="bg-white! p-4! sm:p-6! rounded-2xl! border border-grey-200 shadow-sm">
          <h3 className="text-base! sm:text-lg! font-bold! text-grey-700! tracking-wide!">
            Purchased Services
          </h3>
          <p className="text-2xl! sm:text-3xl! font-extrabold! text-gold-600! mt-2!">
            {entitlements.length}
          </p>
          <p className="text-xs! sm:text-sm! text-grey-500!">Packs + memberships</p>
        </div>
      </div>

      {/* Active Services */}
      <div className="bg-white! p-4! sm:p-6! rounded-2xl! border border-grey-200 shadow-sm">
        <h2 className="text-lg! sm:text-xl! font-semibold! text-grey-700! mb-4!">
          Your Active Services
        </h2>

        {entitlements.length === 0 ? (
          <div className="rounded-xl border border-grey-200 bg-grey-50 p-6 text-center">
            <p className="text-grey-600!">No purchases found yet.</p>
            <p className="text-grey-500! text-sm! mt-1!">
              Buy a program to see it here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {entitlements.map((e) => {
              const remaining = Math.max(0, e.total_credits - e.credits_used);
              const isMembershipLike = !!e.expires_at && (e.total_credits === 0 || e.total_credits === 1);

              return (
                <div key={e.sanity_service_id ?? `${e.service_title}-${e.sanity_service_slug}`} className="rounded-2xl border border-grey-200 p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs! text-grey-500! uppercase tracking-wide">
                        {formatCategory(e.service_category)}
                      </p>
                      <h3 className="text-base! sm:text-lg! font-extrabold! text-grey-900!">
                        {e.service_title ?? "Service"}
                      </h3>
                    </div>

                    <div className="rounded-full bg-gold-50 px-3 py-1">
                      <span className="text-sm! font-bold! text-gold-600!">
                        {isMembershipLike ? "Membership" : "Sessions"}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4">
                    {isMembershipLike ? (
                      <div className="flex items-center justify-between">
                        <span className="text-sm! text-grey-600!">Active until</span>
                        <span className="text-sm! font-semibold! text-grey-900!">
                          {e.expires_at ? formatDate(e.expires_at) : "—"}
                        </span>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center justify-between">
                          <span className="text-sm! text-grey-600!">Remaining</span>
                          <span className="text-sm! font-extrabold! text-grey-900!">
                            {remaining} session(s)
                          </span>
                        </div>

                        <div className="mt-3 h-2 rounded-full bg-grey-100 overflow-hidden">
                          <div
                            className="h-full bg-green-700"
                            style={{
                              width: `${e.total_credits > 0 ? Math.min(100, (remaining / e.total_credits) * 100) : 0}%`,
                            }}
                          />
                        </div>

                        <div className="mt-2 flex items-center justify-between text-xs! text-grey-500!">
                          <span>{e.credits_used} used</span>
                          <span>{e.total_credits} total</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
