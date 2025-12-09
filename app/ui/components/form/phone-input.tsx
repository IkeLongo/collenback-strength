'use client'

import * as React from "react";
import { cn } from "@/app/lib/utils";
import { motion, useMotionTemplate, useMotionValue } from "motion/react";

export interface PhoneInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  value?: string;
  onChange?: (value: string) => void;
}

const PhoneInput = React.forwardRef<HTMLInputElement, PhoneInputProps>(
  ({ className, onChange, value: controlledValue, ...props }, ref) => {
    const radius = 100; // change this to increase the radius of the hover effect
    const [visible, setVisible] = React.useState(false);
    const [internalValue, setInternalValue] = React.useState(controlledValue || "");
    const [lastValue, setLastValue] = React.useState("");
    
    // Use controlled value if provided, otherwise use internal state
    const value = controlledValue !== undefined ? controlledValue : internalValue;

    let mouseX = useMotionValue(0);
    let mouseY = useMotionValue(0);

    function handleMouseMove({ currentTarget, clientX, clientY }: any) {
      let { left, top } = currentTarget.getBoundingClientRect();

      mouseX.set(clientX - left);
      mouseY.set(clientY - top);
    }

    const formatPhoneNumber = (input: string): string => {
      // Remove all non-digit characters
      const digits = input.replace(/\D/g, '');
      
      // Limit to 10 digits
      const limitedDigits = digits.slice(0, 10);
      
      // Format as (xxx) xxx-xxxx
      if (limitedDigits.length >= 6) {
        return `(${limitedDigits.slice(0, 3)}) ${limitedDigits.slice(3, 6)}-${limitedDigits.slice(6)}`;
      } else if (limitedDigits.length >= 3) {
        return `(${limitedDigits.slice(0, 3)}) ${limitedDigits.slice(3)}`;
      } else if (limitedDigits.length > 0) {
        return `(${limitedDigits}`;
      }
      
      return '';
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value;
      
      // Extract digits from current and previous values
      const currentDigits = inputValue.replace(/\D/g, '');
      const lastDigits = lastValue.replace(/\D/g, '');
      
      // If user is deleting and hit a formatting character, remove the last digit
      if (currentDigits.length === lastDigits.length && inputValue.length < lastValue.length) {
        const newDigits = lastDigits.slice(0, -1);
        const formatted = formatPhoneNumber(newDigits);
        
        if (controlledValue !== undefined) {
          // Controlled component
          if (onChange) {
            onChange(formatted);
          }
        } else {
          // Uncontrolled component
          setInternalValue(formatted);
        }
        setLastValue(formatted);
        return;
      }
      
      // Normal formatting
      const formatted = formatPhoneNumber(inputValue);
      
      if (controlledValue !== undefined) {
        // Controlled component
        if (onChange) {
          onChange(formatted);
        }
      } else {
        // Uncontrolled component
        setInternalValue(formatted);
      }
      setLastValue(formatted);
    };

    return (
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
        className="group/input rounded-lg p-[2px] transition duration-300"
      >
        <input
          type="tel"
          className={cn(
            `shadow-input flex h-10 w-full rounded-md border-none bg-white px-3 py-2 text-sm text-grey-700 transition duration-400 group-hover/input:shadow-none file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-grey-500 focus-visible:ring-[2px] focus-visible:ring-gold-500 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50`,
            className
          )}
          ref={ref}
          value={value}
          onChange={handleInputChange}
          placeholder="(555) 123-4567"
          maxLength={14}
          {...props}
        />
      </motion.div>
    );
  }
);
PhoneInput.displayName = "PhoneInput";

export { PhoneInput };