"use client";

import { useEffect, useState } from "react";
import { SyncedHorizontalScroll } from "@/app/ui/components/layout/synced-horizontal-scroll";
import { ActionMultiSelect, type SessionAction } from "@/app/ui/components/select/action";
import { UserAvatar } from "../components/user/user-avatar";
import {
  cancelSessionByAdmin,
  markNoShowByAdmin,
  completeSessionByAdmin,
} from "@/app/lib/admin/session-actions";

const TZ = "America/Chicago";

type SessionRow = {
  id: number;
  client_id: number;
  coach_id: number | null;

  sanity_service_slug: string | null;

  service_category: string | null;
  service_category_title: string | null;
  service_title: string | null;

  scheduled_start: string; // "YYYY-MM-DD HH:MM:SS"
  scheduled_end: string;

  status: "scheduled" | "completed" | "cancelled" | "no_show";

  cancellation_reason: string | null;
  confirmed_at: string | null;

  client_email: string;
  client_first_name: string | null;
  client_last_name: string | null;
  client_avatar_key: string | null;

  coach_email: string | null;
  coach_first_name: string | null;
  coach_last_name: string | null;
  coach_avatar_key?: string | null;
};

type ListResponse = {
  ok: boolean;
  bucket: string;
  limit: number;
  offset: number;
  sessions: SessionRow[];
  message?: string;
};

type CancelModalState = {
  open: boolean;
  sessionId: number | null;
};

function name(first?: string | null, last?: string | null) {
  return [first, last].filter(Boolean).join(" ").trim() || "—";
}

function fmtWhenRange(start: string, end: string) {
  const s = new Date(start.replace(" ", "T") + "Z");
  const e = new Date(end.replace(" ", "T") + "Z");

  const dateLabel = new Intl.DateTimeFormat("en-US", {
    timeZone: TZ,
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(s);

  const startTime = new Intl.DateTimeFormat("en-US", {
    timeZone: TZ,
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(s);

  const endTime = new Intl.DateTimeFormat("en-US", {
    timeZone: TZ,
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(e);

  return (
    <div className="flex flex-col">
      <div className="font-medium text-grey-700">{dateLabel}</div>
      <div className="text-xs text-grey-600">
        {startTime} – {endTime}
      </div>
    </div>
  );
}

function avatarUrlFromKey(key?: string | null) {
  if (!key) return null;
  return `${process.env.NEXT_PUBLIC_R2_PUBLIC_BASE_URL!.replace(/\/$/, "")}/${key}`;
}

export default function NeedsActionTable() {
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<SessionRow[]>([]);
  const [error, setError] = useState<string>("");

  // Pending actions - store actions to be submitted in batch
  const [pendingActions, setPendingActions] = useState<Map<number, SessionAction>>(new Map());
  
  // Submitting state
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Cancel modal
  const [cancelModal, setCancelModal] = useState<CancelModalState>({
    open: false,
    sessionId: null,
  });
  const [cancelReason, setCancelReason] = useState<string>("");

  // ✅ Pagination
  const limit = 10;
  const [page, setPage] = useState(0); // 0-based
  const offset = page * limit;

  // refreshKey still useful, but we’ll keep your pattern
  const [refreshKey, setRefreshKey] = useState(0);

  async function load() {
    setLoading(true);
    setError("");

    try {
      const qs = new URLSearchParams({
        bucket: "needs_action",
        limit: String(limit),
        offset: String(offset),
      });

      const res = await fetch(`/api/admin/sessions?${qs.toString()}`, {
        cache: "no-store",
      });

      const data = (await res.json()) as ListResponse;

      if (!res.ok || !data.ok) {
        throw new Error(data?.message || "Failed to load sessions.");
      }

      setRows(data.sessions ?? []);

      // ✅ If user is on a page that is now empty (ex: after finalizing items),
      // automatically step back one page and reload.
      if ((data.sessions?.length ?? 0) === 0 && page > 0) {
        setPage((p) => p - 1);
      }
    } catch (e: any) {
      setRows([]);
      setError(e?.message ?? "Failed to load sessions.");
    } finally {
      setLoading(false);
    }
  }

  // ✅ reload when page changes or refreshKey changes
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, refreshKey]);

  function openCancel(sessionId: number) {
    setCancelReason("");
    setCancelModal({ open: true, sessionId });
  }

  async function submitCancel() {
    const id = cancelModal.sessionId;
    if (!id) return;

    // Add to pending actions with reason
    setPendingActions((prev) => {
      const next = new Map(prev);
      next.set(id, "cancel_release");
      return next;
    });
    
    setCancelModal({ open: false, sessionId: null });
    setCancelReason("");
  }

  async function handleSubmitAll() {
    if (pendingActions.size === 0) {
      setRefreshKey((k) => k + 1);
      return;
    }

    setIsSubmitting(true);
    setError("");

    const errors: string[] = [];
    const sessionIds = Array.from(pendingActions.keys());

    for (const sessionId of sessionIds) {
      const action = pendingActions.get(sessionId);
      if (!action) continue;

      try {
        if (action === "complete") {
          await completeSessionByAdmin(sessionId);
        } else if (action === "no_show_charge") {
          await markNoShowByAdmin(sessionId);
        } else if (action === "cancel_release") {
          const reason = cancelReason.trim();
          await cancelSessionByAdmin(sessionId,reason || "Cancelled by admin");
        }
      } catch (e: any) {
        errors.push(`Session #${sessionId}: ${e?.message ?? "Failed"}`);
      }
    }

    // Clear pending actions
    setPendingActions(new Map());
    setIsSubmitting(false);

    if (errors.length > 0) {
      setError(errors.join(", "));
    }

    // Refresh the table
    setRefreshKey((k) => k + 1);
  }

  const canPrev = page > 0;
  const canNext = rows.length === limit; // heuristic without total

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-xl! font-[oxanium]! font-semibold! text-grey-700!">Needs Action</h2>
          <p className="text-sm! text-grey-500!">
            Sessions that ended and still need confirmation.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {pendingActions.size > 0 && (
            <span className="text-sm text-grey-600">
              {pendingActions.size} action{pendingActions.size !== 1 ? "s" : ""} pending
            </span>
          )}
          <button
            className="rounded-xl border border-grey-300 bg-white px-3 py-2 text-sm text-grey-700 shadow-sm hover:bg-grey-100 disabled:opacity-50"
            onClick={handleSubmitAll}
            disabled={loading || isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Submit"}
          </button>
        </div>
      </div>

      {/* ✅ Pagination controls (top) */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-grey-600">
          Page <span className="font-semibold text-grey-800">{page + 1}</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            className="rounded-xl border border-grey-300 bg-white px-3 py-2 text-sm text-grey-700 shadow-sm hover:bg-grey-100 disabled:opacity-50"
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={loading || !canPrev}
          >
            Prev
          </button>
          <button
            className="rounded-xl border border-grey-300 bg-white px-3 py-2 text-sm text-grey-700 shadow-sm hover:bg-grey-100 disabled:opacity-50"
            onClick={() => setPage((p) => p + 1)}
            disabled={loading || !canNext}
          >
            Next
          </button>
        </div>
      </div>

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-white p-4 text-sm text-red-600">
          {error}
        </div>
      ) : null}

      <div className="overflow-hidden rounded-2xl border border-grey-300 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <SyncedHorizontalScroll>
            <table className="min-w-[950px] w-full text-sm">
              <colgroup>
                <col className="min-w-[180px]" />
                <col className="min-w-[260px]" />
                <col className="min-w-[200px]" />
                <col className="min-w-[220px]" />
                <col className="min-w-[120px]" />
                <col className="min-w-[220px]" />
              </colgroup>
              <thead className="bg-grey-100 text-grey-700">
                <tr>
                  <th className="px-4 py-3 pl-6 text-left font-semibold min-w-[180px]">
                    When
                  </th>
                  <th className="px-4 py-3 text-left font-semibold min-w-[260px]">
                    Client
                  </th>
                  <th className="px-4 py-3 text-left font-semibold min-w-[200px]">
                    Coach
                  </th>
                  <th className="px-4 py-3 text-left font-semibold min-w-[220px]">
                    Service
                  </th>
                  <th className="px-4 py-3 text-left font-semibold min-w-[120px]">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left font-semibold min-w-[220px]">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td className="px-4 py-4 text-grey-500" colSpan={6}>
                      Loading…
                    </td>
                  </tr>
                ) : rows.length === 0 ? (
                  <tr>
                    <td className="px-4 py-4 text-grey-500" colSpan={6}>
                      No sessions need action.
                    </td>
                  </tr>
                ) : (
                  rows.map((s) => {
                    const clientName = name(s.client_first_name, s.client_last_name);
                    const coachName = name(s.coach_first_name, s.coach_last_name);
                    const hasPendingAction = pendingActions.has(s.id);
                    const pendingAction = pendingActions.get(s.id);

                    return (
                      <tr 
                        key={s.id} 
                        className={`border-t border-grey-300 ${hasPendingAction ? "bg-yellow-50" : ""}`}
                      >
                        <td className="px-4 py-3 pl-6">
                          {fmtWhenRange(s.scheduled_start, s.scheduled_end)}
                          <div className="text-xs text-grey-500">Session #{s.id}</div>
                        </td>

                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <UserAvatar
                              name={clientName}
                              avatarUrl={avatarUrlFromKey(s.client_avatar_key)}
                              size={40}
                            />
                            <div>
                              <div className="font-medium text-grey-700">{clientName}</div>
                              <div className="text-xs text-grey-500">{s.client_email}</div>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-3">
                          <div className="font-medium text-grey-700">{coachName}</div>
                          <div className="text-xs text-grey-500">{s.coach_email ?? "—"}</div>
                        </td>

                        <td className="px-4 py-3">
                          <div className="font-medium text-grey-700">
                            {s.service_category_title ?? s.service_category ?? "—"}
                          </div>
                          {s.service_title ? (
                            <div className="text-xs text-grey-500">{s.service_title}</div>
                          ) : null}
                        </td>

                        <td className="px-4 py-3">
                          <span className="inline-flex items-center rounded-full border border-grey-300 bg-white px-2.5 py-1 text-xs font-medium text-grey-700">
                            {s.status}
                          </span>
                        </td>

                        <td className="px-4 py-3" data-no-drag>
                          <div className="flex items-center gap-2" data-no-drag>
                            <ActionMultiSelect
                              value={pendingAction ?? null}
                              disabled={isSubmitting}
                              onChange={(action) => {
                                if (!action) {
                                  // Remove pending action
                                  setPendingActions((prev) => {
                                    const next = new Map(prev);
                                    next.delete(s.id);
                                    return next;
                                  });
                                  return;
                                }
                                
                                if (action === "cancel_release") {
                                  openCancel(s.id);
                                  return;
                                }
                                
                                // Add to pending actions
                                setPendingActions((prev) => {
                                  const next = new Map(prev);
                                  next.set(s.id, action);
                                  return next;
                                });
                              }}
                              className="w-56 bg-white text-black font-outfit max-w-full rounded-md border border-grey-300 shadow-sm"
                            />

                            {hasPendingAction && (
                              <span className="text-xs font-medium text-yellow-700">Pending</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </SyncedHorizontalScroll>
        </div>
      </div>

      {/* ✅ Pagination controls (bottom) */}
      <div className="flex items-center justify-end gap-2">
        <button
          className="rounded-xl border border-grey-300 bg-white px-3 py-2 text-sm text-grey-700 shadow-sm hover:bg-grey-100 disabled:opacity-50"
          onClick={() => setPage((p) => Math.max(0, p - 1))}
          disabled={loading || !canPrev}
        >
          Prev
        </button>
        <button
          className="rounded-xl border border-grey-300 bg-white px-3 py-2 text-sm text-grey-700 shadow-sm hover:bg-grey-100 disabled:opacity-50"
          onClick={() => setPage((p) => p + 1)}
          disabled={loading || !canNext}
        >
          Next
        </button>
      </div>

      {/* Cancel modal */}
      {cancelModal.open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-lg rounded-2xl border border-grey-300 bg-white p-5 shadow-lg">
            <div className="text-lg font-semibold text-grey-700">
              Cancel session (release credit)
            </div>
            <p className="mt-1 text-sm text-grey-500">
              Add a cancellation reason (optional). This will be saved on the session.
            </p>

            <div className="mt-4">
              <label className="text-sm font-medium text-grey-700">Cancellation reason</label>
              <textarea
                className="mt-2 w-full rounded-xl border border-grey-300 bg-white p-3 text-sm text-grey-700 shadow-sm outline-none focus:border-grey-500"
                rows={4}
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="e.g., Client had an emergency and could not attend."
              />
            </div>

            <div className="mt-4 flex gap-2">
              <button
                className="flex-1 rounded-xl border border-grey-300 bg-white px-3 py-2 text-sm font-medium text-grey-700 hover:bg-grey-100"
                onClick={() => {
                  setCancelModal({ open: false, sessionId: null });
                  setCancelReason("");
                }}
                disabled={isSubmitting}
                data-no-drag>
                Close
              </button>

              <button
                className="flex-1 rounded-xl bg-grey-700 px-3 py-2 text-sm font-semibold text-white hover:bg-grey-900 disabled:opacity-50"
                onClick={submitCancel}
                disabled={isSubmitting}
                data-no-drag
              >
                Confirm cancel
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
