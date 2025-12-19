"use client";

import Link from "next/link";
import { useState } from "react";

export type PackLineItem = {
  kind: "pack";
  session_credit_id: number;
  purchased_at: string | Date;
  status: "active" | "refunded" | "voided";
  expires_at: string | Date | null;

  sanity_service_id: string | null;
  sanity_service_slug: string | null;
  service_title: string | null;
  service_category: string | null;

  total_credits: number;
  credits_used: number;
  credits_reserved: number;
  available_credits: number;

  payment_id: number;
  payment_item_id: number | null;
};

export type MembershipLineItem = {
  kind: "membership";

  // ✅ add this (from subscriptions.id)
  subscription_id: number;

  sanity_service_id: string | null;
  sanity_service_slug: string | null;
  service_title: string | null;
  service_category: string | null;

  status:
    | "trialing"
    | "active"
    | "past_due"
    | "canceled"
    | "unpaid"
    | "incomplete"
    | "incomplete_expired"
    | "paused";

  is_active: boolean;
  state: "active" | "expired";
  current_period_end: Date | null;
};

export type ProgramLineItem = {
  kind: "program";

  program_entitlement_id: number;
  purchased_at: string | Date;
  status: "active" | "refunded" | "voided";

  sanity_service_id: string | null;
  sanity_service_slug: string | null;
  service_title: string | null;
  service_category: string | null;

  program_version: string | null;
  program_notes: string | null;
  cover_image_url: string | null;
  cover_image_alt: string | null;

  // this is the locked version pointer (not shown, but useful)
  sanity_file_asset_ref: string;

  payment_id: number;
  payment_item_id: number;
};

export type LineItem = PackLineItem | MembershipLineItem | ProgramLineItem;

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
  if (item.kind === "pack") return `pack-${item.session_credit_id}`;
  if (item.kind === "membership") return `membership-${item.subscription_id}`;
}

export default function LineItems({
  items,
  title = "Your Services",
}: {
  items: LineItem[];
  title?: string;
}) {
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
      const aActive = a.is_active ? 1 : 0;
      const bActive = b.is_active ? 1 : 0;
      if (aActive !== bActive) return bActive - aActive;

      const aEnd = a.current_period_end ? new Date(a.current_period_end).getTime() : Number.MAX_SAFE_INTEGER;
      const bEnd = b.current_period_end ? new Date(b.current_period_end).getTime() : Number.MAX_SAFE_INTEGER;
      return aEnd - bEnd;
    }

    return 0;
  });

  const isItemActive = (item: LineItem) => {
    if (item.kind === "membership") return item.is_active;
    if (item.kind === "pack") return Number(item.available_credits ?? 0) > 0; // pack active if bookable
  };

  const activeItems = sorted.filter(isItemActive);
  const inactiveItems = sorted.filter((i) => !isItemActive(i));

  const [showInactive, setShowInactive] = useState(false);

  const renderRow = (item: LineItem) => {
    // ✅ MEMBERSHIP ROW
    if (item.kind === "membership") {
      const end = item.current_period_end ? new Date(item.current_period_end) : null;

      const statusLabel =
        item.status === "active"
          ? "Active"
          : item.status === "trialing"
          ? "Trialing"
          : item.status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

      return (
        <div
          key={getItemKey(item)}
          className={[
            "px-4 py-3 flex items-center justify-between gap-3",
            item.is_active ? "" : "opacity-60",
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
                  item.status === "active"
                    ? "bg-green-50 text-green-700 border-green-200"
                    : item.status === "trialing"
                    ? "bg-yellow-50 text-yellow-800 border-yellow-200"
                    : "bg-grey-100 text-grey-700 border-grey-200"
                ].join(" ")}
              >
                {statusLabel}
              </span>
            </div>
            <div className="text-xs text-grey-600">
              {end ? (
                <>
                  Renews <span className="font-semibold">{formatDate(end)}</span>
                </>
              ) : null}
            </div>
          </div>

          {item.is_active && (
            <Link
              href={`/client/schedule?serviceId=${encodeURIComponent(item.sanity_service_id ?? "")}`}
              className="shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold bg-green-700 text-white hover:opacity-90 transition"
            >
              Book
            </Link>
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
            <Link
              href={`/client/schedule?serviceId=${encodeURIComponent(p.sanity_service_id ?? "")}`}
              className="shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold bg-green-700 text-white hover:opacity-90 transition"
            >
              Book
            </Link>
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
    </div>
  );
}

