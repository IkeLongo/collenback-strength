import * as React from "react";
import { MultiSelect } from "../input/multi-select";

export type SessionAction =
  | "complete"
  | "no_show_charge"
  | "no_show_release"
  | "cancel_release";

type ActionMultiSelectProps = {
  value: SessionAction | null;
  onChange: (action: SessionAction | null) => void;
  disabled?: boolean;
  className?: string;
};

const ACTION_OPTIONS: { value: SessionAction; label: string }[] = [
  { value: "complete", label: "Complete session" },
  { value: "no_show_charge", label: "No-show (charge credit)" },
  { value: "no_show_release", label: "No-show (release credit)" },
  { value: "cancel_release", label: "Cancel (release credit)" },
];

export function ActionMultiSelect({
  value,
  onChange,
  disabled,
  className,
}: ActionMultiSelectProps) {
  return (
    <MultiSelect
      options={ACTION_OPTIONS}
      value={value ?? ""}
      onChange={(val) => {
        const action = ACTION_OPTIONS.find(a => a.value === val)?.value ?? null;
        onChange(action);
      }}
      placeholder="Please select action"
      singleSelect
      disabled={disabled}
      className={
        className ??
        "w-48 bg-white text-black font-outfit rounded-md border border-grey-300 shadow-sm"
      }
    />
  );
}
