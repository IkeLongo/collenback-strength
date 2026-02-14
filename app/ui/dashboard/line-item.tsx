"use client";

import { useState } from "react";
import BookCtaButton from "../components/button/BookCtaButton";
import CancelMembershipModal from "../components/modal/CancelMembershipModal";
import RenewMembershipModal from "../components/modal/RenewMembershipModal";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

import type { PackLineItem, MembershipLineItem, LineItem } from "@/app/types/entitlements";

type StripeSubStatus =
  | "trialing"
  | "active"
  | "incomplete"
  | "incomplete_expired"
  | "past_due"
  | "canceled"
  | "unpaid"
  | "paused";

type MembershipEntitlementState = {
  entitled: boolean;
  badgeLabel: string;
  badgeClasses: string;
  footerPrefix?: string; // "Renews", "Active until", etc.
};

function getMembershipEntitlementState(m: MembershipLineItem): MembershipEntitlementState {
  const status = (m.status as StripeSubStatus) ?? "active";
  const endMs = m.current_period_end ? new Date(m.current_period_end).getTime() : null;
  const nowMs = Date.now();

  const hasEnd = typeof endMs === "number" && !Number.isNaN(endMs);
  const withinPeriod = hasEnd ? nowMs < (endMs as number) : true;

  // If we *know* the period ended, they are not entitled.
  // This is the key fix for your problem.
  if (withinPeriod === false) {
    return {
      entitled: false,
      badgeLabel: "Expired",
      badgeClasses: "bg-grey-100 text-grey-700 border-grey-200",
      footerPrefix: "Expired",
    };
  }

  // Hard inactive statuses
  if (status === "canceled") {
    // If canceled but still within paid period, keep entitled and show "Ending"
    if (withinPeriod && m.cancel_at_period_end) {
      return {
        entitled: true,
        badgeLabel: "Ending",
        badgeClasses: "bg-yellow-50 text-yellow-800 border-yellow-200",
        footerPrefix: "Active until",
      };
    }
    return {
      entitled: false,
      badgeLabel: "Canceled",
      badgeClasses: "bg-grey-100 text-grey-700 border-grey-200",
      footerPrefix: "Canceled",
    };
  }

  if (status === "incomplete_expired") {
    return {
      entitled: false,
      badgeLabel: "Expired",
      badgeClasses: "bg-grey-100 text-grey-700 border-grey-200",
      footerPrefix: "Expired",
    };
  }

  if (status === "paused") {
    return {
      entitled: false,
      badgeLabel: "Paused",
      badgeClasses: "bg-blue-50 text-blue-700 border-blue-200",
      footerPrefix: "Paused",
    };
  }

  if (status === "unpaid") {
    return {
      entitled: false,
      badgeLabel: "Unpaid",
      badgeClasses: "bg-red-50 text-red-700 border-red-200",
      footerPrefix: "Unpaid",
    };
  }

  // Statuses that might still be entitled (especially while within period)
  if (status === "past_due") {
    // common: allow access until period end (your call)
    return {
      entitled: true,
      badgeLabel: "Past Due",
      badgeClasses: "bg-orange-50 text-orange-700 border-orange-200",
      footerPrefix: "Payment issue — access ends",
    };
  }

  if (status === "trialing") {
    return {
      entitled: true,
      badgeLabel: "Trial",
      badgeClasses: "bg-yellow-50 text-yellow-800 border-yellow-200",
      footerPrefix: "Trial ends",
    };
  }

  if (status === "incomplete") {
    // Usually not entitled. If you want to be generous, you could allow if withinPeriod.
    return {
      entitled: false,
      badgeLabel: "Incomplete",
      badgeClasses: "bg-grey-100 text-grey-700 border-grey-200",
      footerPrefix: "Incomplete",
    };
  }

  // Default "active"
  // If we have no end date, treat as entitled, but you should rarely hit this if DB is synced.
  if (status === "active") {
    if (m.cancel_at_period_end) {
      return {
        entitled: true,
        badgeLabel: "Ending",
        badgeClasses: "bg-yellow-50 text-yellow-800 border-yellow-200",
        footerPrefix: "Active until",
      };
    }
    return {
      entitled: true,
      badgeLabel: "Active",
      badgeClasses: "bg-green-50 text-green-700 border-green-200",
      footerPrefix: "Renews",
    };
  }

  // Fallback
  const pretty = String(m.status || "unknown")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

  return {
    entitled: withinPeriod, // if period hasn't ended, default to entitled
    badgeLabel: pretty,
    badgeClasses: "bg-grey-100 text-grey-700 border-grey-200",
  };
}

function formatCategory(cat: string | null) {
  if (!cat) return "Service";
  const map: Record<string, string> = {
    in_person: "In-Person Coaching",
    online: "Online Coaching",
    program: "Program",
    nutrition: "Nutrition",
  };
  return map[cat] ?? cat.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatDate(d: string | Date) {
  const dt = typeof d === "string" ? new Date(d) : d;
  return dt.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function plural(n: number, word: string) {
  return n === 1 ? word : `${word}s`;
}

function packStateLabel(p: PackLineItem) {
  const available = Math.max(0, Number(p.available_credits ?? 0));
  const reserved = Math.max(0, Number(p.credits_reserved ?? 0));
  const used = Math.max(0, Number(p.credits_used ?? 0));

  if (available > 0) return "Active";
  if (reserved > 0) return "Fully Scheduled";
  if (used > 0) return "Used";
  return "Depleted";
}

/** ✅ Stable key generator (no idx). */
function getItemKey(item: LineItem) {
  if (item.kind === "pack") return `pack-${item.pack_id}`;
  if (item.kind === "membership") return `membership-${item.subscription_id}`;
}

export default function LineItems({
  items,
  title = "Your Services",
}: {
  items: LineItem[];
  title?: string;
}) {
  const router = useRouter();

  // ✅ Cancel modal state
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelTarget, setCancelTarget] = useState<MembershipLineItem | null>(null);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [cancelError, setCancelError] = useState("");

  // ✅ Renew modal state (NEW)
  const [renewModalOpen, setRenewModalOpen] = useState(false);
  const [renewTarget, setRenewTarget] = useState<MembershipLineItem | null>(null);
  const [renewLoading, setRenewLoading] = useState(false);
  const [renewError, setRenewError] = useState("");

  // ✅ Always render from sorted (not items)
  const sorted = [...items].sort((a, b) => {
    // memberships first
    if (a.kind !== b.kind) return a.kind === "membership" ? -1 : 1;

    // pack sorting: active first, newest first
    if (a.kind === "pack" && b.kind === "pack") {
      const aActive = a.available_credits > 0 ? 1 : 0;
      const bActive = b.available_credits > 0 ? 1 : 0;
      if (aActive !== bActive) return bActive - aActive;
      return new Date(b.purchased_at).getTime() - new Date(a.purchased_at).getTime();
    }

    // membership sorting: active first, then soonest renewal
    if (a.kind === "membership" && b.kind === "membership") {
      const aActive = a.db_active_flag ? 1 : 0;
      const bActive = b.db_active_flag ? 1 : 0;
      if (aActive !== bActive) return bActive - aActive;

      const aEnd = a.current_period_end ? new Date(a.current_period_end).getTime() : Number.MAX_SAFE_INTEGER;
      const bEnd = b.current_period_end ? new Date(b.current_period_end).getTime() : Number.MAX_SAFE_INTEGER;
      return aEnd - bEnd;
    }

    return 0;
  });

  const isItemActive = (item: LineItem) => {
    if (item.kind === "membership") return getMembershipEntitlementState(item).entitled;
    if (item.kind === "pack") return Number(item.available_credits ?? 0) > 0;
    return false;
  };

  async function confirmCancelMembership() {
    if (!cancelTarget) return;

    setCancelLoading(true);
    setCancelError("");

    const name = cancelTarget.service_title ?? "membership";
    const toastId = toast.loading(`Canceling ${name}...`);

    try {
      const res = await fetch("/api/subscriptions/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscription_id: cancelTarget.subscription_id }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || "Failed to cancel membership");

      toast.update(toastId, {
        render: `Canceled ${name}. You’ll keep access until the end of the period.`,
        type: "success",
        isLoading: false,
        autoClose: 3000,
      });

      setCancelModalOpen(false);
      setCancelTarget(null);

      // ✅ pulls fresh entitlements from server component
      router.refresh();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Unknown error";
      setCancelError(msg);

      toast.update(toastId, {
        render: msg,
        type: "error",
        isLoading: false,
        autoClose: 4000,
      });
    } finally {
      setCancelLoading(false);
    }
  }

  async function confirmRenewMembership() {
    if (!renewTarget) return;

    setRenewLoading(true);
    setRenewError("");

    const name = renewTarget.service_title ?? "membership";
    const toastId = toast.loading(`Resuming ${name}...`);

    try {
      const res = await fetch("/api/subscriptions/resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscription_id: renewTarget.subscription_id }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || "Failed to resume renewal");

      toast.update(toastId, {
        render: `Renewal resumed for ${name}.`,
        type: "success",
        isLoading: false,
        autoClose: 3000,
      });

      setRenewModalOpen(false);
      setRenewTarget(null);

      // ✅ refresh server-rendered dashboard data
      router.refresh();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Unknown error";
      setRenewError(msg);

      toast.update(toastId, {
        render: msg,
        type: "error",
        isLoading: false,
        autoClose: 4000,
      });
    } finally {
      setRenewLoading(false);
    }
  }

  const activeItems = sorted.filter(isItemActive);
  const inactiveItems = sorted.filter((i) => !isItemActive(i));

  const [showInactive, setShowInactive] = useState(false);

  const renderRow = (item: LineItem) => {
    // ✅ MEMBERSHIP ROW
    if (item.kind === "membership") {
      const end = item.current_period_end ? new Date(item.current_period_end) : null;
      const state = getMembershipEntitlementState(item);
      const available = Number(item.sessions_available_period ?? 0);
      const bookable = state.entitled && available > 0;

      const footerContent = end ? (
        <div className="flex items-baseline gap-2">
          <span className="text-xs text-grey-600">
            {state.footerPrefix ? `${state.footerPrefix} ` : ""}
            <span className="font-semibold">{formatDate(end)}</span>
          </span>

          {/* Cancel only if truly active and not already ending */}
          {state.entitled && !item.cancel_at_period_end && item.status === "active" && (
            <button
              type="button"
              onClick={() => {
                setCancelTarget(item);
                setCancelModalOpen(true);
                setCancelError("");
              }}
              className="text-xs! font-semibold! text-red-600 hover:text-red-700"
            >
              Cancel
            </button>
          )}

          {/* Renew only if ending and still entitled */}
          {state.entitled && item.cancel_at_period_end && (
            <button
              type="button"
              onClick={() => {
                setRenewTarget(item);
                setRenewModalOpen(true);
                setRenewError("");
              }}
              className="text-xs! font-semibold! text-green-700 hover:text-green-800"
            >
              Renew
            </button>
          )}
        </div>
      ) : null;

      return (
        <div
          key={getItemKey(item)}
          className={[
            "px-4 py-3 flex items-center justify-between gap-3",
            state.entitled ? "" : "opacity-60",
          ].join(" ")}
        >
          <div className="min-w-0">
            <div className="text-[11px] uppercase tracking-wide text-grey-500">
              Membership • {formatCategory(item.service_category)}
            </div>
            <div className="flex items-center gap-2">
              <div className="text-sm font-semibold text-grey-900 truncate">
                {item.service_title ?? "Membership"}
              </div>
              <span
                className={[
                  "inline-block px-2 py-0.5 rounded-full text-xs font-semibold border",
                  state.badgeClasses,
                ].join(" ")}
              >
                {state.badgeLabel}
              </span>
            </div>
            <div className="text-xs text-grey-600 flex items-center gap-2">
              <span>
                <span className="font-semibold">{item.sessions_available_period}</span> of{" "}
                <span className="font-semibold">{item.sessions_per_period}</span>{" "}
                {plural(item.sessions_per_period, "session")} available this period
              </span>
            </div>
            {footerContent}
          </div>

          {bookable && (
            <BookCtaButton
            href={`/client/schedule?serviceId=${encodeURIComponent(item.sanity_service_id ?? "")}`}
            disabled={!bookable}
            disabledReason="You’ve used all sessions for this period."
          />
          )}
        </div>
      );
    }

    // ✅ PACK ROW
    if (item.kind === "pack") {
      const p = item;
      const total = Math.max(0, Number(p.total_credits ?? 0));
      const available = Math.max(0, Number(p.available_credits ?? 0));
      const reserved = Math.max(0, Number(p.credits_reserved ?? 0));
      const used = Math.max(0, Number(p.credits_used ?? 0));

      const label = packStateLabel(p);
      const isBookable = available > 0;

      return (
        <div
          key={getItemKey(p)}
          className={[
            "px-4 py-3 flex items-center justify-between gap-3",
            isBookable ? "" : "opacity-60",
          ].join(" ")}
        >
          <div className="min-w-0">
            <div className="text-[11px] uppercase tracking-wide text-grey-500">
              Pack • {formatCategory(p.service_category)}
            </div>
            <div className="flex items-center gap-2">
              <div className="text-sm font-semibold text-grey-900 truncate">
                {p.service_title ?? "Service"}
              </div>
              <span
                className={[
                  "inline-block px-2 py-0.5 rounded-full text-xs font-semibold border",
                  label === "Active"
                    ? "bg-green-50 text-green-700 border-green-200"
                    : label === "Fully Scheduled"
                    ? "bg-yellow-50 text-yellow-800 border-yellow-200"
                    : label === "Used"
                    ? "bg-grey-200 text-grey-800 border-grey-300"
                    : "bg-grey-100 text-grey-700 border-grey-200"
                ].join(" ")}
              >
                {label}
              </span>
            </div>
            <div className="text-xs text-grey-600">
              <span className="font-semibold">{available}</span> of{" "}
              <span className="font-semibold">{total}</span> {plural(total, "session")} available
            </div>
            <div className="text-[11px] text-grey-500">
              Purchased {formatDate(p.purchased_at)}
            </div>
          </div>

          {isBookable && (
            <BookCtaButton
              href={`/client/schedule?serviceId=${encodeURIComponent(p.sanity_service_id ?? "")}`}
              label="Book"
            />
          )}
        </div>
      );
    }
  };

  return (
    <div className="bg-white rounded-2xl">
      <div className="px-4 py-3 border-b border-grey-200 flex items-center justify-between">
        {/* <h2 className="text-sm! font-semibold! text-grey-700!">{title}</h2> */}
        <span className="text-xs text-grey-500">{sorted.length} item(s)</span>
      </div>

      {sorted.length === 0 ? (
        <div className="p-4 text-sm text-grey-600">No items found.</div>
      ) : (
        <div className="divide-y divide-grey-200">
          {/* ✅ ACTIVE SECTION */}
          <div className="px-4 py-2 text-[11px] font-bold uppercase tracking-wide text-grey-500 bg-grey-50">
            Active
          </div>
          {activeItems.length ? (
            activeItems.map(renderRow)
          ) : (
            <div className="px-4 py-3 text-sm text-grey-600">No active items.</div>
          )}

          {/* ✅ INACTIVE SECTION (collapsible) */}
          {inactiveItems.length > 0 && (
            <>
              <button
                type="button"
                onClick={() => setShowInactive((v) => !v)}
                className="w-full flex items-center justify-between px-4 py-2 text-[11px] font-bold uppercase tracking-wide text-grey-600 bg-grey-50 border-t border-grey-200 hover:bg-grey-100 transition"
                aria-expanded={showInactive}
              >
                <div className="text-[11px] font-bold uppercase tracking-wide text-grey-500 bg-grey-50">
                  Inactive
                </div>
                <span className="flex items-center gap-2">
                  <span className="text-[11px] font-semibold normal-case text-grey-500">
                    {inactiveItems.length} item(s)
                  </span>
                  <span className="text-grey-500">{showInactive ? "▾" : "▸"}</span>
                </span>
              </button>

              {showInactive && (
                <div className="divide-y divide-grey-200">
                  {inactiveItems.map(renderRow)}
                </div>
              )}
            </>
          )}
        </div>
      )}
      <CancelMembershipModal
        open={cancelModalOpen}
        target={cancelTarget}
        loading={cancelLoading}
        error={cancelError}
        onClose={() => {
          setCancelModalOpen(false);
          setCancelTarget(null);
        }}
        onConfirm={confirmCancelMembership}
      />;
      <RenewMembershipModal
        open={renewModalOpen}
        target={renewTarget}
        loading={renewLoading}
        error={renewError}
        onClose={() => {
          setRenewModalOpen(false);
          setRenewTarget(null);
        }}
        onConfirm={confirmRenewMembership}
      />
    </div>
  );
}
