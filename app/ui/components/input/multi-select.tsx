import * as React from "react"
import { cn } from "@/app/lib/utils"
import { useMotionTemplate, useMotionValue, motion } from "framer-motion"
import { useMemo } from "react"

export interface MultiSelectProps
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'value' | 'onChange'> {
  options: { value: string; label: string; availability?: string }[]
  value?: string | string[]
  onChange?: (value: string | string[]) => void
  placeholder?: string
  singleSelect?: boolean
  menuClassName?: string // custom dropdown menu styling
  dropdownPlacement?: "top" | "bottom" // dropdown position
  selectedValueClassName?: string // custom class for selected value span
}

const MultiSelect = React.forwardRef<HTMLSelectElement, MultiSelectProps>(
  ({ className, options, value = [], onChange, placeholder = "Select options...", singleSelect = false, menuClassName, dropdownPlacement = "bottom", selectedValueClassName, ...props }, ref) => {
    const radius = 100 // change this to increase the radius of the hover effect
    const [visible, setVisible] = React.useState(false)
    const [isOpen, setIsOpen] = React.useState(false)
    // Always coerce value to array for internal state
    const initialSelected = React.useMemo(() => {
      const arr =
        typeof value === "string"
          ? value ? [value] : []
          : Array.isArray(value)
            ? value
            : [];

      // singleSelect = keep only first, and drop "" values
      const cleaned = arr.filter((v) => v && v.trim().length > 0);

      return singleSelect ? (cleaned[0] ? [cleaned[0]] : []) : cleaned;
    }, [value, singleSelect]);

    const [selectedValues, setSelectedValues] = React.useState<string[]>(initialSelected);
    const dropdownRef = React.useRef<HTMLDivElement>(null)

    const normalizedSelectedValues = useMemo(() => {
      return selectedValues.filter((v) => v && v.trim().length > 0);
    }, [selectedValues]);

    let mouseX = useMotionValue(0)
    let mouseY = useMotionValue(0)

    function handleMouseMove({ currentTarget, clientX, clientY }: any) {
      let { left, top } = currentTarget.getBoundingClientRect()

      mouseX.set(clientX - left)
      mouseY.set(clientY - top)
    }

    React.useEffect(() => {
      const arr =
        typeof value === "string"
          ? value ? [value] : []
          : Array.isArray(value)
            ? value
            : [];

      const cleaned = arr.filter((v) => v && v.trim().length > 0);
      setSelectedValues(singleSelect ? (cleaned[0] ? [cleaned[0]] : []) : cleaned);
    }, [value, singleSelect]);

    // Close dropdown when clicking outside
    React.useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
          setIsOpen(false)
        }
      }

      if (isOpen) {
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
      }
    }, [isOpen])

    const toggleOption = (optionValue: string) => {
      if (singleSelect) {
        const isSame = selectedValues[0] === optionValue;

        if (isSame) {
          setSelectedValues([]);
          onChange?.("");
        } else {
          setSelectedValues([optionValue]);
          onChange?.(optionValue);
        }

        setIsOpen(false);
        return;
      }

      // multi-select behavior (unchanged)
      const newValues = selectedValues.includes(optionValue)
        ? selectedValues.filter((v) => v !== optionValue)
        : [...selectedValues, optionValue];

      setSelectedValues(newValues);
      onChange?.(newValues);
    };

    const removeOption = (optionValue: string, e: React.MouseEvent) => {
      e.stopPropagation()
      if (singleSelect) {
        setSelectedValues([])
        onChange?.("")
      } else {
        const newValues = selectedValues.filter(v => v !== optionValue)
        setSelectedValues(newValues)
        onChange?.(newValues)
      }
    }

    return (
      <div className="relative" ref={dropdownRef}>
        {/* Hidden select for form compatibility */}
        <select
          ref={ref}
          multiple
          value={selectedValues}
          onChange={() => {}} // Controlled by our custom logic
          className="sr-only"
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        {/* Custom dropdown trigger */}
        <motion.div
          style={{
            background: useMotionTemplate`
              radial-gradient(
                ${visible ? radius + "px" : "0px"} circle at ${mouseX}px ${mouseY}px,
                #CB9F24,
                transparent 80%
              )
            `,
          }}
          onMouseMove={handleMouseMove}
          onMouseEnter={() => setVisible(true)}
          onMouseLeave={() => setVisible(false)}
          className="group/multiselect rounded-2xl p-[2px] transition duration-300"
        >
          <div
            className={cn(
              "shadow-input flex min-h-10 w-full cursor-pointer items-center justify-between rounded-2xl! border-transparent bg-white px-3 py-2 text-sm text-black transition duration-400 group-hover/multiselect:shadow-none placeholder:text-neutral-400 focus-visible:ring-[2px] focus-visible:ring-neutral-400 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
              // removed dark: classes, set default to what dark: was
              // bg-white → bg-white (already set), text-black → text-black, shadow-input → shadow-input, focus-visible:ring-neutral-400 → focus-visible:ring-neutral-400
              className
            )}
            onClick={() => setIsOpen(!isOpen)}
          >
          <div className="flex flex-1 items-center gap-2 min-w-0">
            {normalizedSelectedValues.length === 0 ? (
              <span className="text-neutral-400 whitespace-nowrap truncate py-1">
                {placeholder}
              </span>
            ) : (
              <span
                className={cn(
                  "font-outfit text-base truncate",
                  selectedValueClassName ? selectedValueClassName : "text-black"
                )}
              >
                {options.find((o) => o.value === normalizedSelectedValues[0])?.label ?? normalizedSelectedValues[0]}
              </span>
            )}
          </div>
          <svg
            className={cn(
              "h-4 w-4 transition-transform",
              isOpen && "rotate-180"
            )}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
          </div>
        </motion.div>

        {/* Dropdown options */}
        {isOpen && (
          <div
            className={cn(
              "absolute z-50 w-full bg-white rounded-2xl border border-grey-300 shadow-lg",
              dropdownPlacement === "top" ? "bottom-full mb-1" : "mt-1"
            )}
          >
            <div className={cn("max-h-60 overflow-y-auto p-1 space-y-1", menuClassName)}>
              {options.map((option) => {
                const isActive = selectedValues.includes(option.value);
                return (
                  <div
                    key={option.value}
                    className={cn(
                      "relative flex select-none items-center rounded-xl px-4 py-2 text-base font-outfit transition-colors duration-150 cursor-pointer border",
                      isActive
                        ? "bg-[var(--color-gold-100)] border-[var(--color-gold-500)] text-black font-semibold shadow-sm"
                        : "bg-white border-transparent text-black hover:bg-grey-100"
                    )}
                    onClick={() => toggleOption(option.value)}
                  >
                    <span className="w-full text-left">{option.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    )
  }
)

MultiSelect.displayName = "MultiSelect"

export { MultiSelect }