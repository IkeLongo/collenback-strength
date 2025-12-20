"use client";

import React from "react";
import { toast } from "react-toastify";
import { Label } from "@/app/ui/components/form/label";
import { Input } from "@/app/ui/components/form/input";
import { PhoneInput } from "@/app/ui/components/form/phone-input";
import { cn } from "@/app/lib/utils";
import { UserAvatar } from "@/app/ui/components/user/user-avatar";

type InitialProfile = {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  avatarKey: string | null;
  avatarUrl: string | null;
};

export default function ProfileClient({
  initialProfile,
}: {
  initialProfile: InitialProfile;
}) {
  const [saving, setSaving] = React.useState(false);
  const [uploading, setUploading] = React.useState(false);

  const [profile, setProfile] = React.useState(initialProfile);
  const [form, setForm] = React.useState({
    firstName: initialProfile.firstName,
    lastName: initialProfile.lastName,
    phone: initialProfile.phone,
  });

  const onSave = async () => {
    setSaving(true);
    try {
      console.log("[ProfileClient] PATCH /api/profile payload:", form);

      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json().catch(() => ({}));
      console.log("[ProfileClient] PATCH status:", res.status, data);

      if (!res.ok) throw new Error(data?.message ?? "Failed to save profile");

      toast.success("Profile updated");
      setProfile((p) => ({
        ...p,
        firstName: form.firstName,
        lastName: form.lastName,
        phone: form.phone,
      }));
    } catch (e: any) {
      console.error("[ProfileClient] save error:", e);
      toast.error(e.message ?? "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const onPickAvatar = async (file: File) => {
    // basic client-side limits
    const maxBytes = 2 * 1024 * 1024;
    if (file.size > maxBytes) {
      toast.error("Please choose an image under 2MB.");
      return;
    }

    setUploading(true);
    try {
      console.log("[ProfileClient] presign for:", { type: file.type, size: file.size });

      // 1) presign
      const presignRes = await fetch("/api/profile/avatar/presign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contentType: file.type }),
      });

      const presign = await presignRes.json();
      console.log("[ProfileClient] presign status:", presignRes.status, presign);

      if (!presignRes.ok) throw new Error(presign?.message ?? "Failed to start upload");

      const { uploadUrl, key } = presign as { uploadUrl: string; key: string };

      // 2) direct upload to R2
      console.log("[ProfileClient] PUT upload starting...");

      const putRes = await fetch(uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });

      console.log("[ProfileClient] PUT status:", putRes.status);

      if (!putRes.ok) throw new Error("Upload failed. Please try again.");

      // 3) commit
      console.log("[ProfileClient] commit key:", key);

      const commitRes = await fetch("/api/profile/avatar/commit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key }),
      });

      const commit = await commitRes.json();
      console.log("[ProfileClient] commit status:", commitRes.status, commit);

      if (!commitRes.ok) throw new Error(commit?.message ?? "Failed to save avatar");

      toast.success("Profile photo updated");

      // cache bust for immediate refresh
      const newUrl = commit.avatarUrl ? `${commit.avatarUrl}?v=${Date.now()}` : null;

      setProfile((p) => ({
        ...p,
        avatarKey: key,
        avatarUrl: newUrl,
      }));
    } catch (e: any) {
      console.error("[ProfileClient] upload error:", e);
      toast.error(e.message ?? "Upload failed");
    } finally {
      setUploading(false);
    }
  };

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

        <div className="text-xs text-grey-600">PNG/JPG/WEBP, under 2MB.</div>
      </div>

      {/* Form */}
      <div className="mt-8 grid gap-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>First name</Label>
            <Input
              value={form.firstName}
              onChange={(e) => setForm({ ...form, firstName: e.target.value })}
            />
          </div>
          <div>
            <Label>Last name</Label>
            <Input
              value={form.lastName}
              onChange={(e) => setForm({ ...form, lastName: e.target.value })}
            />
          </div>
        </div>

        <div>
          <Label>Phone</Label>
          <PhoneInput
            value={form.phone}
            onChange={(v) => setForm({ ...form, phone: v })}
          />
        </div>

        <div>
          <Label>Email (read-only)</Label>
          <Input value={profile.email} readOnly />
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

          <a
            href="/forgot-password"
            className="text-sm! text-grey-600! hover:text-grey-800! underline underline-offset-4"
          >
            Reset password
          </a>
        </div>
      </div>
    </div>
  );
}
