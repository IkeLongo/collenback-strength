"use client";

import * as React from "react";
import { MultiSelect } from "../input/multi-select";

export type ExceptionType = "blocked" | "custom";

type ExceptionTypeSelectProps = {
  value: ExceptionType;
  onChange: (t: ExceptionType) => void;
  disabled?: boolean;
  className?: string;
  menuClassName?: string; // custom dropdown menu styling
  dropdownPlacement?: "top" | "bottom"; // dropdown placement
};

const TYPE_OPTIONS: { value: ExceptionType; label: string }[] = [
  { value: "blocked", label: "Blocked (no availability)" },
  { value: "custom", label: "Custom window" },
];

export function ExceptionTypeSelect({
  value,
  onChange,
  disabled,
  className,
  menuClassName,
  dropdownPlacement = "bottom",
}: ExceptionTypeSelectProps) {
  return (
    <MultiSelect
      options={TYPE_OPTIONS}
      value={value}
      onChange={(val) => {
        const next = TYPE_OPTIONS.find((o) => o.value === val)?.value;
        onChange(next ?? "blocked");
      }}
      placeholder="Select type"
      singleSelect
      disabled={disabled}
      className={
        className ??
        "w-full bg-white text-black font-outfit rounded-md border border-grey-300 shadow-sm"
      }
      menuClassName={menuClassName}
      dropdownPlacement={dropdownPlacement}
    />
  );
}