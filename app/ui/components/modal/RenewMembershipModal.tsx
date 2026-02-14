"use client";

import type { MembershipLineItem } from "@/app/types/entitlements";

function formatDate(d: string | Date) {
  const dt = typeof d === "string" ? new Date(d) : d;
  return dt.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

export default function RenewMembershipModal({
  open,
  target,
  loading,
  error,
  onClose,
  onConfirm,
}: {
  open: boolean;
  target: MembershipLineItem | null;
  loading: boolean;
  error: string;
  onClose: () => void;
  onConfirm: () => void;
}) {
  if (!open || !target) return null;

  const end = target.current_period_end ? new Date(target.current_period_end) : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <button
        className="absolute inset-0 bg-black/40"
        onClick={() => {
          if (!loading) onClose();
        }}
        aria-label="Close modal"
        type="button"
      />

      <div className="relative w-[92%] max-w-md rounded-2xl bg-white p-5 shadow-lg">
        <div className="text-sm font-semibold text-grey-900">Resume renewal?</div>

        <div className="mt-2 text-sm text-grey-600">
          This membership will continue renewing automatically.
          {end ? (
            <>
              {" "}
              Your next renewal is{" "}
              <span className="font-semibold">{formatDate(end)}</span>.
            </>
          ) : null}
        </div>

        {error ? <div className="mt-3 text-sm text-red-600">{error}</div> : null}

        <div className="mt-4 flex items-center justify-end gap-2">
          <button
            type="button"
            className="px-3 py-2 rounded-xl border border-grey-200 text-sm font-semibold text-grey-700 hover:bg-grey-50"
            onClick={() => {
              if (!loading) onClose();
            }}
          >
            No, keep canceled
          </button>

          <button
            type="button"
            disabled={loading}
            className="px-3 py-2 rounded-xl bg-green-600 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-60"
            onClick={onConfirm}
          >
            {loading ? "Resuming..." : "Yes, resume renewal"}
          </button>
        </div>
      </div>
    </div>
  );
}
