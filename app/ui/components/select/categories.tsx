"use client";

import * as React from "react";
import { MultiSelect } from "../input/multi-select";
import { Label } from "../form/label";
import { LabelInputContainer } from "../input/label-input-container";

export type CategoryKey = "in_person" | "online" | "program" | "nutrition";

const CATEGORY_LABEL: Record<CategoryKey, string> = {
  in_person: "In-Person Coaching",
  online: "Online Coaching",
  program: "Programs",
  nutrition: "Nutrition Coaching",
};

type CategorySelectProps = {
  value: CategoryKey;
  onChange: (category: CategoryKey) => void;
  disabled?: boolean;
  className?: string;
};

export function CategorySelect({
  value,
  onChange,
  disabled,
  className,
}: CategorySelectProps) {
  const options = (Object.keys(CATEGORY_LABEL) as CategoryKey[]).map((k) => ({
    value: k,                 // <-- category key
    label: CATEGORY_LABEL[k], // <-- label text
  }));

  return (
    <LabelInputContainer className="mb-4">
      <Label className="text-grey-700! pt-2" htmlFor="category-select">
        Select a Category:
      </Label>

      <MultiSelect
        options={options}
        value={value}
        onChange={(val) => {
          // MultiSelect is singleSelect; val is string
          const next = (val || "in_person") as CategoryKey;
          onChange(next);
        }}
        placeholder="Select a category..."
        singleSelect
        disabled={disabled}
        className={
          className ||
          "w-full bg-white text-black font-outfit max-w-full rounded-md border border-grey-300 shadow"
        }
      />
    </LabelInputContainer>
  );
}
