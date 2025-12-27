"use client";

import * as React from "react";
import { MultiSelect } from "@/app/ui/components/input/multi-select";

type TimeSelectProps = {
  value: string; // "HH:MM"
  onChange: (v: string) => void;
  disabled?: boolean;

  stepMinutes?: number;  // default 15
  min?: string;          // default "05:00"
  max?: string;          // default "22:00"
  placeholder?: string;  // default "Select time"
  className?: string;
  menuClassName?: string; // custom dropdown menu styling
  dropdownPlacement?: "top" | "bottom"; // dropdown placement
};

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

function toMinutes(hhmm: string) {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

function fromMinutes(total: number) {
  const h = Math.floor(total / 60);
  const m = total % 60;
  return `${pad2(h)}:${pad2(m)}`;
}

function label12(hhmm: string) {
  const [h, m] = hhmm.split(":").map(Number);
  const d = new Date();
  d.setHours(h, m, 0, 0);

  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(d);
}

export function TimeSelect({
  value,
  onChange,
  disabled,
  stepMinutes = 15,
  min = "05:00",
  max = "22:00",
  placeholder = "Select time",
  className,
  menuClassName,
  dropdownPlacement = "bottom",
}: TimeSelectProps) {
  const options = React.useMemo(() => {
    const start = toMinutes(min);
    const end = toMinutes(max);

    const list: { value: string; label: string }[] = [];
    for (let t = start; t <= end; t += stepMinutes) {
      const hhmm = fromMinutes(t);
      list.push({ value: hhmm, label: label12(hhmm) });
    }
    return list;
  }, [min, max, stepMinutes]);

  return (
    <MultiSelect
      options={options}
      value={value ?? ""} // ✅ controlled
      onChange={(val) => {
        if (Array.isArray(val)) {
          onChange(val[0] || "");
        } else {
          onChange(val || "");
        }
      }}
      placeholder={placeholder}
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