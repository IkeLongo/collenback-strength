"use client";

import React from "react";
import { toast } from "react-toastify";
import { ProfilePanel } from "@/app/ui/components/profile/ProfilePanel";

type InitialProfile = {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  avatarKey: string | null;
  avatarUrl: string | null;
};

export default function ProfileAdmin({
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
      console.log("[ProfileAdmin] PATCH /api/profile payload:", form);

      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json().catch(() => ({}));
      console.log("[ProfileAdmin] PATCH status:", res.status, data);

      if (!res.ok) throw new Error(data?.message ?? "Failed to save profile");

      toast.success("Profile updated");
      setProfile((p) => ({
        ...p,
        firstName: form.firstName,
        lastName: form.lastName,
        phone: form.phone,
      }));
    } catch (e: any) {
      console.error("[ProfileAdmin] save error:", e);
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
      console.log("[ProfileAdmin] presign for:", { type: file.type, size: file.size });

      // 1) presign
      const presignRes = await fetch("/api/profile/avatar/presign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contentType: file.type }),
      });

      const presign = await presignRes.json();
      console.log("[ProfileAdmin] presign status:", presignRes.status, presign);

      if (!presignRes.ok) throw new Error(presign?.message ?? "Failed to start upload");

      const { uploadUrl, key } = presign as { uploadUrl: string; key: string };

      // 2) direct upload to R2
      console.log("[ProfileAdmin] PUT upload starting...");

      const putRes = await fetch(uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });

      console.log("[ProfileAdmin] PUT status:", putRes.status);

      if (!putRes.ok) throw new Error("Upload failed. Please try again.");

      // 3) commit
      console.log("[ProfileAdmin] commit key:", key);

      const commitRes = await fetch("/api/profile/avatar/commit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key }),
      });

      const commit = await commitRes.json();
      console.log("[ProfileAdmin] commit status:", commitRes.status, commit);

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
      console.error("[ProfileAdmin] upload error:", e);
      toast.error(e.message ?? "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <ProfilePanel
      profile={profile}
      form={form}
      onFormChange={setForm}
      onSave={onSave}
      saving={saving}
      uploading={uploading}
      onPickAvatar={onPickAvatar}
      readOnlyEmail={true}
      showResetPassword={true}
    />
  );
}
