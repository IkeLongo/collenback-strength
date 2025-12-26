"use client";

import React from "react";
import { Label } from "@/app/ui/components/form/label";
import { Input } from "@/app/ui/components/form/input";
import { PhoneInput } from "@/app/ui/components/form/phone-input";
import { cn } from "@/app/lib/utils";
import { UserAvatar } from "@/app/ui/components/user/user-avatar";

export type ProfilePanelProps = {
  profile: {
    email: string;
    firstName: string;
    lastName: string;
    phone: string;
    avatarKey: string | null;
    avatarUrl: string | null;
  };
  form: {
    firstName: string;
    lastName: string;
    phone: string;
  };
  onFormChange: (form: { firstName: string; lastName: string; phone: string }) => void;
  onSave: () => void;
  saving?: boolean;
  uploading?: boolean;
  onPickAvatar?: (file: File) => void;
  readOnlyEmail?: boolean;
  showResetPassword?: boolean;
};

export function ProfilePanel({
  profile,
  form,
  onFormChange,
  onSave,
  saving = false,
  uploading = false,
  onPickAvatar,
  readOnlyEmail = true,
  showResetPassword = true,
}: ProfilePanelProps) {
  return (
    <div className="rounded-2xl bg-white p-6 shadow-input">
      {/* Avatar */}
      <div className="flex items-center gap-4">
        <div className="h-16 w-16 rounded-full bg-grey-200 overflow-hidden flex items-center justify-center">
          <UserAvatar
            name={`${profile.firstName} ${profile.lastName}`.trim()}
            avatarUrl={profile.avatarUrl}
            size={64}
          />
        </div>

        {onPickAvatar && (
          <label
            className={cn(
              "inline-flex items-center justify-center rounded-md bg-grey-100 px-3 py-2 text-sm font-semibold text-grey-700 border border-grey-300 hover:cursor-pointer",
              uploading ? "opacity-60 cursor-not-allowed" : ""
            )}
          >
            {uploading ? "Uploading…" : "Change photo"}
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
              disabled={uploading}
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) onPickAvatar(f);
                e.currentTarget.value = "";
              }}
            />
          </label>
        )}

        <div className="text-xs text-grey-600">PNG/JPG/WEBP, under 2MB.</div>
      </div>

      {/* Form */}
      <div className="mt-8 grid gap-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>First name</Label>
            <Input
              value={form.firstName}
              onChange={(e) => onFormChange({ ...form, firstName: e.target.value })}
            />
          </div>
          <div>
            <Label>Last name</Label>
            <Input
              value={form.lastName}
              onChange={(e) => onFormChange({ ...form, lastName: e.target.value })}
            />
          </div>
        </div>

        <div>
          <Label>Phone</Label>
          <PhoneInput
            value={form.phone}
            onChange={(v) => onFormChange({ ...form, phone: v })}
          />
        </div>

        <div>
          <Label>Email {readOnlyEmail ? "(read-only)" : null}</Label>
          <Input value={profile.email} readOnly={readOnlyEmail} />
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={onSave}
            disabled={saving}
            className={cn(
              "group/btn relative h-10 rounded-md bg-gradient-to-br from-grey-700 to-grey-600 px-4 font-medium text-white hover:cursor-pointer",
              saving ? "opacity-60 cursor-not-allowed" : ""
            )}
          >
            {saving ? "Saving…" : "Save changes"}
          </button>

          {showResetPassword && (
            <a
              href="/forgot-password"
              className="text-sm! text-grey-600! hover:text-grey-800! underline underline-offset-4"
            >
              Reset password
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
