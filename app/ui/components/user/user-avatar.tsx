"use client";

import React from "react";
import { cn } from "@/app/lib/utils";

type UserAvatarProps = {
  name?: string | null;            // used for initials fallback
  avatarUrl?: string | null;       // if present, show image
  size?: number;                   // px, default 32
  className?: string;
};

function getInitials(name?: string | null) {
  const n = (name ?? "").trim();
  if (!n) return "U";

  const parts = n.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  }
  return parts[0][0].toUpperCase();
}

export function UserAvatar({
  name,
  avatarUrl,
  size = 32,
  className,
}: UserAvatarProps) {
  const initials = getInitials(name);

  return (
    <div
      className={cn(
        "rounded-full overflow-hidden flex items-center justify-center font-medium text-white border-solid border-black border-2",
        className
      )}
      style={{ width: size, height: size }}
    >
      {avatarUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={avatarUrl}
          alt={name ?? "User"}
          className="h-full w-full object-cover"
          onError={(e) => {
            // If image fails to load, fallback to initials
            console.warn("[UserAvatar] image failed to load, falling back to initials");
            (e.currentTarget as HTMLImageElement).style.display = "none";
          }}
        />
      ) : (
        <div
          className="h-full w-full flex items-center justify-center bg-gold-500 text-sm"
          aria-label="User initials"
        >
          {initials}
        </div>
      )}
    </div>
  );
}
