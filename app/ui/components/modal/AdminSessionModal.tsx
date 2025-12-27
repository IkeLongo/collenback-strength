"use client";

import { useEffect } from "react";
import { cn } from "@/app/lib/utils";
import { UserAvatar } from "@/app/ui/components/user/user-avatar";

type Props = {
  open: boolean;
  onClose: () => void;
  session: any | null; // you can type this as SessionRow
  onConfirm?: () => void;
  onCancel?: () => void;
  onNoShow?: () => void;
  loading?: boolean;
  loadingText?: string;
};

function avatarUrlFromKey(key?: string | null) {
  if (!key) return null;
  // ✅ adjust this prefix to match how you serve files
  return `${process.env.NEXT_PUBLIC_R2_PUBLIC_BASE_URL!.replace(/\/$/, "")}/${key}`;
}

const TZ = "America/Chicago";

function formatSessionRange(start: string, end: string) {
  // Treat DB datetime as UTC
  const startDate = new Date(start.replace(" ", "T") + "Z");
  const endDate = new Date(end.replace(" ", "T") + "Z");

  const dayLabel = new Intl.DateTimeFormat("en-US", {
    timeZone: TZ,
    month: "long",
    day: "numeric",
  }).format(startDate);

  const startTime = new Intl.DateTimeFormat("en-US", {
    timeZone: TZ,
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(startDate);

  const endTime = new Intl.DateTimeFormat("en-US", {
    timeZone: TZ,
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(endDate);

  return {
    dayLabel,
    timeRange: `${startTime} - ${endTime}`,
  };
}

export default function AdminSessionModal({
  open,
  onClose,
  session,
  onConfirm,
  onCancel,
  onNoShow,
  loading = false,
  loadingText = "Updating…",
}: Props) {
  // ESC to close
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open || !session) return null;

  return (
    <div className="fixed inset-0 z-[60]">
      {/* overlay */}
      <div
        className="absolute inset-0 bg-grey-900/60"
        onClick={() => {
          if (loading) return; // ✅ don’t close while loading
          onClose();
        }}
      />

      {/* panel */}
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div
          className={cn(
            "w-full max-w-lg rounded-2xl bg-white shadow-xl border border-grey-200",
            "overflow-hidden"
          )}
          onClick={(e) => e.stopPropagation()}
        >
          {/* ✅ Loading overlay inside panel */}
          {loading ? (
            <div className="absolute inset-0 z-10 bg-white/70 backdrop-blur-[1px] flex items-center justify-center">
              <div className="flex items-center gap-3 rounded-xl border border-grey-200 bg-white px-4 py-3 shadow-sm">
                <svg className="h-5 w-5 animate-spin text-grey-700" viewBox="0 0 24 24" fill="none">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                <div className="text-sm font-semibold text-grey-700">
                  {loadingText ?? "Updating…"}
                </div>
              </div>
            </div>
          ) : null}
          {/* header */}
          <div className="flex items-start justify-between gap-3 px-5 py-4 border-b border-grey-200">
            <div className="flex items-center gap-3">
              <UserAvatar
                name={`${session.client_first_name ?? ""} ${session.client_last_name ?? ""}`.trim()}
                avatarUrl={avatarUrlFromKey(session.client_avatar_key)}
                size={64}
              />

              <div>
                <div className="text-sm text-grey-500">Session</div>
                <div className="text-lg font-semibold text-grey-900">
                  {session.service_category_title ?? session.service_category ?? "Session"}
                </div>
                <div className="text-sm text-grey-700">
                  {session.client_first_name} {session.client_last_name}
                </div>
              </div>
            </div>

            <button
              className="rounded-md p-2 hover:bg-grey-100 text-black"
              onClick={onClose}
              aria-label="Close"
              type="button"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none">
                <path
                  d="M6 18L18 6M6 6l12 12"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>

          {/* body */}
          <div className="px-5 py-4 space-y-3 text-sm text-grey-800">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="text-grey-500 text-xs">Coach</div>
                <div className="font-semibold text-grey-900">
                  {session.coach_first_name ? `${session.coach_first_name} ${session.coach_last_name}` : "—"}
                </div>
              </div>
              <div>
                <div className="text-grey-500 text-xs">Status</div>
                <div className="font-semibold text-grey-900">{session.status}</div>
              </div>
            </div>

            {(() => {
              const { dayLabel, timeRange } = formatSessionRange(
                session.scheduled_start,
                session.scheduled_end
              );

              return (
                <>
                  <div className="font-semibold text-grey-900 mb-0">{dayLabel}</div>
                  <div className="text-sm text-grey-700">{timeRange}</div>
                </>
              );
            })()}

            {session.location ? (
              <div>
                <div className="text-grey-500 text-xs">Location</div>
                <div className="font-semibold">{session.location}</div>
              </div>
            ) : null}

            {session.notes ? (
              <div>
                <div className="text-grey-500 text-xs">Notes</div>
                <div className="font-semibold whitespace-pre-wrap">{session.notes}</div>
              </div>
            ) : null}
          </div>

          {/* footer actions */}
          <div className="px-5 py-4 border-t border-grey-200 flex items-center justify-end gap-2">
            <button
              type="button"
              className="rounded-md border border-grey-300 bg-white px-3 py-2 text-sm font-semibold text-grey-900 hover:bg-grey-100"
              onClick={onClose}
            >
              Close
            </button>

            {/* Only show if scheduled */}
            {session.status === "scheduled" ? (
              <>
                <button
                  type="button"
                  className="rounded-md border border-red-700 bg-red-600 px-3 py-2 text-sm font-semibold text-white hover:bg-red-700"
                  onClick={onCancel}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="rounded-md border border-amber-700 bg-amber-600 px-3 py-2 text-sm font-semibold text-white hover:bg-amber-700"
                  onClick={onNoShow}
                >
                  No-show
                </button>
                <button
                  type="button"
                  className="rounded-md border border-green-800 bg-green-700 px-3 py-2 text-sm font-semibold text-white hover:bg-green-800"
                  onClick={onConfirm}
                >
                  Confirm (Completed)
                </button>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
