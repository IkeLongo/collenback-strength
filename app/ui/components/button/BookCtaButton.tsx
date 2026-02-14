"use client";

import Link from "next/link";

export default function BookCtaButton({
  href,
  label = "Book",
  className = "",
  disabled = false,
  disabledReason,
}: {
  href: string;
  label?: string;
  className?: string;
  disabled?: boolean;
  disabledReason?: string;
}) {
  const base = [
    "inline-flex items-center justify-center",
    "h-10 px-4 rounded-md",
    "!text-base !font-semibold",
    "transition-colors",
    className,
  ].join(" ");

  const enabledClasses = [
    base,
    "text-sm !text-grey-700 border-2 border-gold-500",
    "hover:bg-gold-500 hover:!text-white",
    "active:bg-gold-700",
    "focus:outline-none focus:ring-2 focus:ring-gold-300 focus:ring-offset-2",
  ].join(" ");

  const disabledClasses = [
    base,
    "bg-grey-100 text-grey-500",
    "border border-grey-200",
    "cursor-not-allowed select-none",
  ].join(" ");

  if (disabled) {
    return (
      <button
        type="button"
        className={disabledClasses}
        disabled
        title={disabledReason ?? "Not available"}
        aria-disabled="true"
      >
        {label}
      </button>
    );
  }

  return (
    <Link href={href} className={enabledClasses}>
      {label}
    </Link>
  );
}
