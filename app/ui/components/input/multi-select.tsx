import * as React from "react"
import { cn } from "@/app/lib/utils"
import { useMotionTemplate, useMotionValue, motion } from "framer-motion"

export interface MultiSelectProps
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'value' | 'onChange'> {
  options: { value: string; label: string; availability?: string }[]
  value?: string | string[]
  onChange?: (value: string | string[]) => void
  placeholder?: string
  singleSelect?: boolean
}

const MultiSelect = React.forwardRef<HTMLSelectElement, MultiSelectProps>(
  ({ className, options, value = [], onChange, placeholder = "Select options...", singleSelect = false, ...props }, ref) => {
    const radius = 100 // change this to increase the radius of the hover effect
    const [visible, setVisible] = React.useState(false)
    const [isOpen, setIsOpen] = React.useState(false)
    // Always coerce value to array for internal state
    const initialSelected = singleSelect
      ? value && typeof value === 'string' ? [value] : Array.isArray(value) ? value : []
      : Array.isArray(value) ? value : value ? [value] : [];
    const [selectedValues, setSelectedValues] = React.useState<string[]>(initialSelected)
    const dropdownRef = React.useRef<HTMLDivElement>(null)

    let mouseX = useMotionValue(0)
    let mouseY = useMotionValue(0)

    function handleMouseMove({ currentTarget, clientX, clientY }: any) {
      let { left, top } = currentTarget.getBoundingClientRect()

      mouseX.set(clientX - left)
      mouseY.set(clientY - top)
    }

    React.useEffect(() => {
      if (singleSelect) {
        if (typeof value === 'string') setSelectedValues([value])
        else if (Array.isArray(value) && value.length > 0) setSelectedValues([value[0]])
        else setSelectedValues([])
      } else {
        setSelectedValues(Array.isArray(value) ? value : value ? [value] : [])
      }
    }, [value, singleSelect])

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
      let newValues: string[];
      if (singleSelect) {
        newValues = [optionValue];
        setSelectedValues(newValues);
        onChange?.(optionValue);
        setIsOpen(false);
      } else {
        newValues = selectedValues.includes(optionValue)
          ? selectedValues.filter(v => v !== optionValue)
          : [...selectedValues, optionValue];
        setSelectedValues(newValues);
        onChange?.(newValues);
        setIsOpen(false);
      }
    }

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
              "shadow-input flex min-h-10 w-full cursor-pointer items-center justify-between rounded-md border-transparent bg-white px-3 py-2 text-sm text-black transition duration-400 group-hover/multiselect:shadow-none placeholder:text-neutral-400 focus-visible:ring-[2px] focus-visible:ring-neutral-400 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
              "dark:bg-white dark:text-black dark:shadow-input dark:focus-visible:ring-neutral-400",
              className
            )}
            onClick={() => setIsOpen(!isOpen)}
          >
          <div className="flex flex-1 flex-wrap gap-1">
            {selectedValues.length === 0 ? (
              <span className="text-neutral-400">{placeholder}</span>
            ) : (
              selectedValues.map((val) => {
                const label = options.find(opt => opt.value === val)?.label || val;
                const isActive = selectedValues.includes(val);
                return (
                  <span
                    key={val}
                    className={cn(
                      "font-outfit text-base",
                      isActive ? "text-black" : "text-white"
                    )}
                  >
                    {label}
                  </span>
                );
              })
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
          <div className="absolute z-50 mt-1 w-full bg-black rounded-2xl border border-grey-800 shadow-lg">
            <div className="max-h-60 overflow-y-auto p-1 space-y-1">
              {options.map((option) => {
                const isActive = selectedValues.includes(option.value);
                return (
                  <div
                    key={option.value}
                    className={cn(
                      "relative flex select-none items-center rounded-xl px-4 py-2 text-base font-outfit transition-colors duration-150",
                      isActive ? "bg-grey-500 text-white" : "bg-black text-white hover:bg-grey-900 cursor-pointer"
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