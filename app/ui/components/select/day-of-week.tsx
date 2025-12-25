"use client";

import * as React from "react";
import { MultiSelect } from "../input/multi-select";

export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6;

type DayOfWeekSelectProps = {
  value: DayOfWeek | null;
  onChange: (day: DayOfWeek | null) => void;
  disabled?: boolean;
  className?: string;
  placeholder?: string;
};

const DAY_OPTIONS: { value: DayOfWeek; label: string }[] = [
  { value: 0, label: "Sunday" },
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
];

export function DayOfWeekSelect({
  value,
  onChange,
  disabled,
  className,
  placeholder = "Select day",
}: DayOfWeekSelectProps) {
  return (
    <MultiSelect
      options={DAY_OPTIONS.map((o) => ({ value: String(o.value), label: o.label }))}
      value={value === null ? "" : String(value)}
      onChange={(val) => {
        if (!val) return onChange(null);
        const num = Number(val);
        if (Number.isNaN(num) || num < 0 || num > 6) return onChange(null);
        onChange(num as DayOfWeek);
      }}
      placeholder={placeholder}
      singleSelect
      disabled={disabled}
      className={
        className ??
        "w-full bg-white text-black font-outfit rounded-md border border-grey-300 shadow-sm"
      }
    />
  );
}