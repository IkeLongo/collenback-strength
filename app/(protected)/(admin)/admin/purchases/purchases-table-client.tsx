// app/ui/admin/purchases/purchases-table-client.tsx
"use client";

import { useMemo, useState } from "react";
import { UserAvatar } from "@/app/ui/components/user/user-avatar";
import { cn } from "@/app/lib/utils";

type Totals = {
  revenue_30d_cents: number;
  count_30d: number;
  refunds_30d: number;
  active_subs: number;
};

type PurchaseRow = {
  id: number;
  user_id: number;
  user_name: string;
  user_email: string;
  user_avatar_key: string | null;

  amount_cents: number;
  currency: string;
  provider: string;

  provider_session_id: string | null;
  provider_payment_id: string | null;

  status: "pending" | "succeeded" | "failed" | "refunded";
  paid_at: string | null;
  created_at: string;

  subscription_id: number | null;
  subscription_status: string | null;
  current_period_end: string | null;

  notes: string | null;
};

type LineItem = {
  id: number;
  payment_id: number;
  service_title: string | null;
  service_category: string | null;
  quantity: number;
  unit_amount_cents: number;
  amount_cents: number;
  currency: string;
  sessions_purchased: number | null;
};

function money(cents: number, currency = "usd") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format((cents ?? 0) / 100);
}

function avatarUrlFromKey(key?: string | null) {
  if (!key) return null;
  return `${process.env.NEXT_PUBLIC_R2_PUBLIC_BASE_URL!.replace(/\/$/, "")}/${key}`;
}

export default function PurchasesTableClient(props: {
  initialPurchases: PurchaseRow[];
  initialTotals: Totals;
  initialTotal: number;
  initialLimit: number;
  initialOffset: number;
}) {
  const [rows, setRows] = useState<PurchaseRow[]>(props.initialPurchases ?? []);
  const [totals, setTotals] = useState<Totals>(props.initialTotals);
  const [total, setTotal] = useState<number>(props.initialTotal);
  const [limit, setLimit] = useState<number>(props.initialLimit);
  const [offset, setOffset] = useState<number>(props.initialOffset);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // expanded rows + lazy-loaded items
  const [openIds, setOpenIds] = useState<Record<number, boolean>>({});
  const [itemsByPaymentId, setItemsByPaymentId] = useState<Record<number, LineItem[]>>({});
  const [itemsLoadingId, setItemsLoadingId] = useState<number | null>(null);

  const page = Math.floor(offset / limit) + 1;
  const pages = Math.max(1, Math.ceil(total / limit));

  async function fetchPage(nextOffset: number) {
    setLoading(true);
    setError("");

    try {
      const qs = new URLSearchParams({
        limit: String(limit),
        offset: String(nextOffset),
      });

      const res = await fetch(`/api/admin/purchases?${qs.toString()}`, { cache: "no-store" });
      const data = await res.json();

      if (!res.ok || !data?.ok) throw new Error(data?.message || "Failed to load purchases.");

      setRows(data.purchases ?? []);
      setTotals(data.totals);
      setTotal(data.total);
      setOffset(data.offset);
      setLimit(data.limit);
      setOpenIds({});
    } catch (e: any) {
      setError(e?.message ?? "Failed to load purchases.");
    } finally {
      setLoading(false);
    }
  }

  async function toggleRow(paymentId: number) {
    const isOpen = !!openIds[paymentId];
    const next = !isOpen;

    setOpenIds((m) => ({ ...m, [paymentId]: next }));

    // lazy-load once
    if (next && !itemsByPaymentId[paymentId]) {
      setItemsLoadingId(paymentId);
      try {
        const res = await fetch(`/api/admin/purchases/${paymentId}/items`, { cache: "no-store" });
        const data = await res.json();
        if (!res.ok || !data?.ok) throw new Error(data?.message || "Failed to load line items.");
        setItemsByPaymentId((m) => ({ ...m, [paymentId]: data.items ?? [] }));
      } catch (e: any) {
        setError(e?.message ?? "Failed to load line items.");
      } finally {
        setItemsLoadingId(null);
      }
    }
  }

  const summary = useMemo(() => {
    return [
      { label: "Revenue (30d)", value: money(totals?.revenue_30d_cents ?? 0, "usd") },
      { label: "Purchases (30d)", value: String(totals?.count_30d ?? 0) },
      { label: "Refunds (30d)", value: String(totals?.refunds_30d ?? 0) },
      { label: "Active subs", value: String(totals?.active_subs ?? 0) },
    ];
  }, [totals]);

  return (
    <div className="space-y-4">
      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {summary.map((c) => (
          <div key={c.label} className="rounded-2xl border border-grey-300 bg-white p-4 shadow-sm">
            <div className="text-xs text-grey-500">{c.label}</div>
            <div className="text-lg font-semibold text-grey-900">{c.value}</div>
          </div>
        ))}
      </div>

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-white p-4 text-sm text-red-600">{error}</div>
      ) : null}

      <div className="overflow-hidden rounded-2xl border border-grey-300 bg-white shadow-sm">
        <div className="overflow-x-auto overflow-y-hidden">
          <table className="min-w-[1100px] w-full text-sm">
            <colgroup>
              <col className="w-[44px]" />
              <col className="w-[240px]" />
              <col className="w-[100px]" />
              <col className="w-[140px]" />
              <col className="w-[140px]" />
              <col className="w-[220px]" />
            </colgroup>

            <thead className="bg-grey-100 text-grey-700">
              <tr>
                <th className="px-4 py-3 text-left font-semibold"></th>
                <th className="px-4 py-3 text-left font-semibold">Customer</th>
                <th className="px-4 py-3 text-left font-semibold">Amount</th>
                <th className="px-4 py-3 text-left font-semibold">Status</th>
                <th className="px-4 py-3 text-left font-semibold">Paid at</th>
                <th className="px-4 py-3 text-left font-semibold">Provider</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-4 text-grey-500">Loading…</td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-4 text-grey-500">No purchases found.</td>
                </tr>
              ) : (
                rows.map((p) => {
                  const open = !!openIds[p.id];
                  const items = itemsByPaymentId[p.id] ?? [];
                  const isItemsLoading = itemsLoadingId === p.id;

                  return (
                    <>
                      <tr key={p.id} className="border-t border-grey-300">
                        <td className="px-4 py-3">
                          <button
                            type="button"
                            onClick={() => toggleRow(p.id)}
                            className="rounded-md p-1 hover:bg-grey-100 text-grey-500"
                            aria-label={open ? "Collapse" : "Expand"}
                          >
                            <svg
                              className={cn("h-5 w-5 transition-transform duration-200", open ? "rotate-90" : "rotate-0")}
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path d="M7.25 5.5L12.25 10l-5 4.5V5.5z" />
                            </svg>
                          </button>
                        </td>

                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <UserAvatar
                              name={p.user_name || p.user_email}
                              avatarUrl={avatarUrlFromKey(p.user_avatar_key)}
                              size={36}
                            />
                            <div>
                              <div className="font-medium text-grey-900">{p.user_name || "—"}</div>
                              <div className="text-xs text-grey-500">{p.user_email}</div>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-3 font-semibold text-grey-900">
                          {money(p.amount_cents, p.currency)}
                        </td>

                        <td className="px-4 py-3">
                          <span className="inline-flex items-center rounded-full border border-grey-300 bg-white px-2.5 py-1 text-xs font-medium text-grey-700">
                            {p.status}
                          </span>
                        </td>

                        <td className="px-4 py-3 text-grey-700">
                          {p.paid_at ? (
                            (() => {
                              const dt = new Date(p.paid_at + (p.paid_at.endsWith('Z') ? '' : 'Z'));
                              const chicagoDate = dt.toLocaleString("en-US", {
                                timeZone: "America/Chicago",
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              });
                              const chicagoTime = dt.toLocaleTimeString("en-US", {
                                timeZone: "America/Chicago",
                                hour: "2-digit",
                                minute: "2-digit",
                              });
                              return (
                                <div className="flex flex-col">
                                  <span>{chicagoDate}</span>
                                  <span className="text-xs text-grey-500">{chicagoTime}</span>
                                </div>
                              );
                            })()
                          ) : (
                            "—"
                          )}
                        </td>

                        <td className="px-4 py-3 text-grey-700">
                          <div className="text-xs text-grey-500">{p.provider}</div>
                          <div className="text-xs text-grey-500">payment: {p.provider_payment_id ?? "—"}</div>
                        </td>
                      </tr>

                      {/* Expand row (smooth dropdown) */}
                      <tr className="border-t border-grey-200">
                        <td colSpan={6} className="px-0 py-0">
                          <div
                            className={cn(
                              "grid transition-[grid-template-rows] duration-300 ease-out",
                              open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                            )}
                          >
                            <div className="overflow-hidden">
                              <div className="bg-grey-50 px-6 py-4">
                                {isItemsLoading ? (
                                  <div className="text-sm text-grey-500">Loading line items…</div>
                                ) : items.length === 0 ? (
                                  <div className="text-sm text-grey-500">No line items.</div>
                                ) : (
                                  <div className="space-y-2">
                                    <div className="text-sm font-semibold text-grey-700">Line items</div>
                                    <div className="divide-y divide-grey-200 rounded-xl border border-grey-200 bg-white">
                                      {items.map((it) => (
                                        <div key={it.id} className="flex items-center justify-between px-4 py-3 text-sm">
                                          <div className="min-w-0">
                                            <div className="font-medium text-grey-900">
                                              {it.service_title ?? "Service"}
                                            </div>
                                            <div className="text-xs text-grey-500">
                                              {it.service_category ?? "—"} • qty {it.quantity}
                                              {it.sessions_purchased ? ` • sessions ${it.sessions_purchased}` : ""}
                                            </div>
                                          </div>
                                          <div className="font-semibold text-grey-900">
                                            {money(it.amount_cents, it.currency)}
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    </>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between border-t border-grey-200 bg-white px-4 py-3">
          <div className="text-xs text-grey-500">
            Page {page} of {pages} • {total} total
          </div>
          <div className="flex items-center gap-2">
            <button
              className="rounded-xl border border-grey-300 bg-white px-3 py-2 text-sm text-grey-700 hover:bg-grey-100 disabled:opacity-50"
              onClick={() => fetchPage(Math.max(0, offset - limit))}
              disabled={loading || offset === 0}
            >
              Prev
            </button>
            <button
              className="rounded-xl border border-grey-300 bg-white px-3 py-2 text-sm text-grey-700 hover:bg-grey-100 disabled:opacity-50"
              onClick={() => fetchPage(offset + limit)}
              disabled={loading || offset + limit >= total}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
