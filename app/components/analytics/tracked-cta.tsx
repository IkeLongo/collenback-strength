// /app/components/analytics/TrackedCTA.tsx

"use client";

import Link from "next/link";
import { trackCtaClick } from "@/lib/analytics/events";
import React from "react";

type TrackedCTAProps = {
  href: string;
  cta_id: string;
  location: string;
  label?: string;
  className?: string;
  onClick?: React.MouseEventHandler<HTMLAnchorElement>;
  children: React.ReactNode;
};

export function TrackedCTA({
  href,
  cta_id,
  location,
  label,
  className,
  onClick,
  children,
}: TrackedCTAProps) {
  const handleMouseDown: React.MouseEventHandler<HTMLAnchorElement> = (e) => {
    // Fire analytics early (more reliable than click)
    const analyticsLabel = label || (typeof children === 'string' ? children : cta_id);
    trackCtaClick({ cta_id, label: analyticsLabel, location, href });
  };

  const handleClick: React.MouseEventHandler<HTMLAnchorElement> = (e) => {
    // Allow parent click logic (close menus, etc.)
    onClick?.(e);
  };

  return (
    <Link
      href={href}
      onMouseDown={handleMouseDown}
      onClick={handleClick}
      className={className}
    >
      {children}
    </Link>
  );
}