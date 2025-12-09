import React, { useState, useEffect } from "react";

interface CustomSwitchProps {
  defaultSelected?: boolean;
  isDisabled?: boolean;
  size?: "sm" | "md" | "lg";
  isSelected?: boolean;
  onValueChange?: (value: boolean) => void;
  classNames?: {
    base?: string;
    track?: string;
    thumb?: string;
  };
}

// px values for track width/height and padding
const sizeMap = {
  sm: { w: "w-8", h: "h-4", trackW: 32, trackH: 16, pad: 3 },
  md: { w: "w-12", h: "h-6", trackW: 48, trackH: 24, pad: 4 },
  lg: { w: "w-16", h: "h-8", trackW: 64, trackH: 32, pad: 5 },
};

export default function CustomSwitch({
  defaultSelected = false,
  isDisabled = false,
  size = "md",
  isSelected,
  onValueChange,
  classNames = {},
}: CustomSwitchProps) {
  const [checked, setChecked] = useState(defaultSelected);

  // Controlled mode
  useEffect(() => {
    if (typeof isSelected === "boolean") setChecked(isSelected);
  }, [isSelected]);

  const handleToggle = () => {
    if (isDisabled) return;
    const newValue = !checked;
    if (typeof isSelected !== "boolean") setChecked(newValue);
    onValueChange?.(newValue);
  };

  const { w, h, trackW, trackH, pad } = sizeMap[size];

  // Dynamically calculate thumb size based on track height and padding
  const thumbSize = trackH - pad * 2;
  const maxTranslate = trackW - thumbSize - pad * 2;

  return (
    <button
      type="button"
      disabled={isDisabled}
      aria-pressed={checked}
      onClick={handleToggle}
      className={`
        relative inline-flex items-center transition-colors duration-200
        rounded-full focus:outline-none
        ${w} ${h}
        ${isDisabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
        ${checked ? "bg-gold-500" : "bg-gray-300"}
        ${classNames.base || ""}
      `}
      style={{
        minWidth: trackW,
        minHeight: trackH,
      }}
    >
      <span
        className={`
          absolute transition-transform duration-200 rounded-full
          bg-white shadow
          ${classNames.thumb || ""}
        `}
        style={{
          width: thumbSize,
          height: thumbSize,
          left: pad,
          top: `calc(50% - ${thumbSize / 2}px)`,
          transform: checked
            ? `translateX(${maxTranslate}px)`
            : "translateX(0)",
        }}
      />
      <span
        className={`
          absolute inset-0 rounded-full
          ${classNames.track || ""}
        `}
      />
    </button>
  );
}