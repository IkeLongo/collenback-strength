"use client";

import { useEffect, useState } from "react";
import { useLoading } from "./loading-context";

export default function FadeOverlay() {
  const { loading } = useLoading();
  const [fade, setFade] = useState(true);

  useEffect(() => {
    if (!loading) {
      const timeout = setTimeout(() => setFade(false), 300);
      return () => clearTimeout(timeout);
    }
  }, [loading]);

  return (
    fade && (
      <div className={`fixed inset-0 z-[9999] bg-grey-100 transition-opacity duration-300 pointer-events-none ${fade ? "opacity-100" : "opacity-0"}`} />
    )
  );
}