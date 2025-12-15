import { MultiSelect } from "../input/multi-select";
import { Label } from "../form/label";
import { LabelInputContainer } from "../input/label-input-container";
import * as React from "react";

export type ServiceOption = { id: string; slug: string; title: string };

type ServiceSelectProps = {
  services: ServiceOption[];
  value: ServiceOption | null;
  onChange: (service: ServiceOption | null) => void;
  loading?: boolean;
  className?: string;
};

export function ServiceSelect({ services, value, onChange, loading, className }: ServiceSelectProps) {
  return (
    <LabelInputContainer className="mb-4">
      <Label className="text-grey-700!" htmlFor="tab-select">
        Select a Service:
      </Label>
      <MultiSelect
        options={services.map(s => ({ value: s.id, label: s.title }))}
        value={value?.id ?? ""}
        onChange={val => {
          const svc = services.find(s => s.id === val) ?? null;
          onChange(svc);
        }}
        placeholder={services.length === 0 ? "No services found" : "Select a service to continue."}
        singleSelect
        disabled={loading || services.length === 0}
        className={className || "w-full bg-white text-black font-outfit max-w-full rounded-md border border-grey-300 shadow"}
      />
    </LabelInputContainer>
  );
}