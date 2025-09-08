"use client";
import { useEffect, useState } from "react";

export default function FadeOverlay() {
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(() => setFade(false), 300);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <div
      className={`fixed inset-0 z-[9999] bg-grey-100 transition-opacity duration-300 pointer-events-none ${
        fade ? "opacity-100" : "opacity-0"
      }`}
    />
  );
}