"use client";

import { ReactNode, useEffect, useRef, useState, ElementType } from "react";

type FadeInUpProps = {
  children: ReactNode;
  delay?: number;
  always?: boolean;
  as?: ElementType;
  className?: string;
};

export default function FadeInUp({
  children,
  delay = 0,
  always = false,
  as: Tag = "div",
  className = "",
}: FadeInUpProps) {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    if (always) {
      setVisible(true);
      return;
    }
    const handleScroll = () => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      if (rect.top < window.innerHeight - 50 && rect.bottom > 0) {
        setVisible(true);
      } else if (rect.top >= window.innerHeight) {
        setVisible(false);
      }
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, [always]);

  return (
    <Tag
      ref={ref as any}
      className={className}
      style={{
        transition: "opacity 0.7s cubic-bezier(0.22,1,0.36,1), transform 0.7s cubic-bezier(0.22,1,0.36,1)",
        transitionDelay: `${delay}ms`,
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(40px)",
        willChange: "opacity, transform",
      }}
    >
      {children}
    </Tag>
  );
}