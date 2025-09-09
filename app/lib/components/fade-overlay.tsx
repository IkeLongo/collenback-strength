"use client";

import { useEffect, useState } from "react";
import { useLoading } from "./loading-context";

export default function FadeOverlay() {
  const { loading } = useLoading();
  const [fade, setFade] = useState(true);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (!loading) {
      setFade(false); // Start fade out
      const timeout = setTimeout(() => setVisible(false), 1000); // Remove after transition
      return () => clearTimeout(timeout);
    } else {
      setFade(true);
      setVisible(true);
    }
  }, [loading]);

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] bg-grey-100 transition-opacity duration-1000 pointer-events-none ${
        fade ? "opacity-100" : "opacity-0"
      }`}
    />
  );
}