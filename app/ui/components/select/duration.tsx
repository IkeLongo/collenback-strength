import * as React from "react";
import { MultiSelect } from "../input/multi-select";
import { Label } from "../form/label";
import { LabelInputContainer } from "../input/label-input-container";

export type DurationMinutes = 30 | 60;
export type DurationOption = { durationMinutes: DurationMinutes };

type DurationSelectProps = {
  options: DurationOption[];
  value: 30 | 60 | null; // just the number for value
  onChange: (duration: 30 | 60 | null) => void;
  disabled?: boolean;
  className?: string;
  placeholder?: string;
};

export function DurationSelect({
  options,
  value,
  onChange,
  disabled,
  className,
  placeholder = "Select duration...",
}: DurationSelectProps) {
  // Remove duplicates and sort
  const uniqueOptions = Array.from(new Set(options.map((o) => o.durationMinutes))).sort(
    (a, b) => a - b
  );

  return (
    <LabelInputContainer className="mb-4">
      <Label className="text-grey-700!" htmlFor="duration-select">
        Select a Duration:
      </Label>

      <MultiSelect
        options={uniqueOptions.map((d) => ({ value: String(d), label: `${d} minutes` }))}
        value={value === null ? "" : String(value)}   // ✅ empty shows placeholder
        onChange={(val) => {
          // MultiSelect singleSelect can return "" when cleared
          if (!val || (typeof val === "string" && val.trim() === "")) {
            onChange(null);
            return;
          }
          onChange(Number(val) as 30 | 60);
        }}
        placeholder={placeholder}
        singleSelect
        disabled={disabled}
        className={className || ""}
      />
    </LabelInputContainer>
  );
}

