"use client";

import * as React from "react";
import { MultiSelect } from "../input/multi-select";
import { Label } from "../form/label";
import { LabelInputContainer } from "../input/label-input-container";

export type KindKey = "membership" | "pack";

const KIND_LABEL: Record<KindKey, string> = {
  membership: "Memberships",
  pack: "Packs",
};

type TypeSelectProps = {
  value: KindKey;
  onChange: (kind: KindKey) => void;
  counts?: { memberships: number; packs: number };
  disabled?: boolean;
  className?: string;
};

export function TypeSelect({
  value,
  onChange,
  counts,
  disabled,
  className,
}: TypeSelectProps) {
  const options = (Object.keys(KIND_LABEL) as KindKey[]).map((k) => {
    const badge =
      k === "membership" ? counts?.memberships : counts?.packs;

    return {
      value: k,
      label:
        typeof badge === "number"
          ? `${KIND_LABEL[k]} (${badge})`
          : KIND_LABEL[k],
    };
  });

  return (
    <LabelInputContainer className="mb-2 max-w-[350px]">
      <Label className="text-grey-700!" htmlFor="type-select">
        Select a Type:
      </Label>

      <MultiSelect
        options={options}
        value={value}
        onChange={(val) => {
          const next = (val || "membership") as KindKey;
          onChange(next);
        }}
        placeholder="Select a type..."
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
