import { MultiSelect } from "../input/multi-select";
import { Label } from "../form/label";
import { LabelInputContainer } from "../input/label-input-container";
import * as React from "react";

export type CoachOption = { id: number; name: string };

type CoachSelectProps = {
	coaches: CoachOption[];
	value: number | null;
	onChange: (coachId: number | null) => void;
	loading?: boolean;
	className?: string;
};

export function CoachSelect({ coaches, value, onChange, loading, className }: CoachSelectProps) {
	return (
    <LabelInputContainer className="mb-4 max-w-94">
      <Label className="text-grey-700!" htmlFor="tab-select">
        Select a Coach:
      </Label>
      <MultiSelect
        options={coaches.map(c => ({ value: String(c.id), label: c.name }))}
        value={value ? String(value) : ""}
        onChange={val => {
          const nextCoachId = val ? Number(val) : null;
          onChange(nextCoachId);
        }}
        placeholder={coaches.length === 0 ? "No coaches found" : "Select a coach..."}
        singleSelect
        disabled={loading || coaches.length === 0}
        className={className || "w-full bg-white text-black font-outfit max-w-full rounded-md border border-grey-300 shadow"}
      />
    </LabelInputContainer>
	);
}