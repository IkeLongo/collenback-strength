"use client";

import { useEffect } from "react";
import { cn } from "@/app/lib/utils";
import { UserAvatar } from "@/app/ui/components/user/user-avatar";
import Link from "next/link";

type UserRow = {
  id: number;
  email: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  is_active: boolean;
  created_at: string;
  avatar_key: string | null;
  roles: string[];
};

type Props = {
  open: boolean;
  user: UserRow | null;
  onClose: () => void;
};

function name(first?: string | null, last?: string | null) {
  return [first, last].filter(Boolean).join(" ").trim() || "—";
}

function avatarUrlFromKey(key?: string | null) {
  if (!key) return null;
  return `${process.env.NEXT_PUBLIC_R2_PUBLIC_BASE_URL!.replace(/\/$/, "")}/${key}`;
}

export default function AdminUserModal({ open, user, onClose }: Props) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open || !user) return null;

  const fullName = name(user.first_name, user.last_name);

  return (
    <div className="fixed inset-0 z-[60]">
      <div className="absolute inset-0 bg-grey-900/60" onClick={onClose} />

      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div
          className={cn(
            "w-full max-w-lg rounded-2xl bg-white shadow-xl border border-grey-200 overflow-hidden"
          )}
          onClick={(e) => e.stopPropagation()}
        >
          {/* header */}
          <div className="flex items-start justify-between gap-3 px-5 py-4 border-b border-grey-200">
            <div className="flex items-center gap-3">
              <UserAvatar
                name={fullName}
                avatarUrl={avatarUrlFromKey(user.avatar_key)}
                size={56}
              />
              <div>
                <div className="text-lg font-semibold text-grey-900">{fullName}</div>
                <div className="text-sm text-grey-600">{user.email}</div>
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
          <div className="px-5 py-4 space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="text-grey-500 text-xs">Phone</div>
                <div className="font-semibold text-grey-900">{user.phone ?? "—"}</div>
              </div>
              <div>
                <div className="text-grey-500 text-xs">Status</div>
                <div className="font-semibold text-grey-900">
                  {user.is_active ? "active" : "inactive"}
                </div>
              </div>
            </div>

            <div>
              <div className="text-grey-500 text-xs">Roles</div>
              <div className="flex flex-wrap gap-2 mt-1">
                {(user.roles?.length ? user.roles : ["—"]).map((r) => (
                  <span
                    key={r}
                    className="inline-flex items-center rounded-full border border-grey-300 bg-white px-2.5 py-1 text-xs font-semibold text-grey-700"
                  >
                    {r}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <div className="text-grey-500 text-xs">Created</div>
              <div className="font-semibold text-grey-900">
                {new Date(user.created_at).toLocaleString()}
              </div>
            </div>
          </div>

          {/* footer */}
          <div className="px-5 py-4 border-t border-grey-200 flex items-center justify-end gap-2">
            <button
              type="button"
              className="rounded-md border border-grey-300 bg-white px-3 py-2 text-sm font-semibold text-grey-900 hover:bg-grey-100"
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
