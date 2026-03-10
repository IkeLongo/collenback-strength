"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

const CookieBannerUI = dynamic(() => import("./CookieBannerUI"), {
  loading: () => null,
});

export default function CookieBanner() {
  const [shouldLoad, setShouldLoad] = useState(false);
  const loadedRef = useRef(false);

  useEffect(() => {
    console.log("[CookieBanner] mounted");
    
    if (loadedRef.current) return;

    const triggerLoad = () => {
      if (loadedRef.current) return;
      loadedRef.current = true;
      setShouldLoad(true);
      cleanup();
    };

    const onFirstInteraction = () => triggerLoad();
    const timeoutId = window.setTimeout(triggerLoad, 2500);

    const cleanup = () => {
      window.removeEventListener("pointerdown", onFirstInteraction);
      window.removeEventListener("keydown", onFirstInteraction);
      window.removeEventListener("scroll", onFirstInteraction);
      window.removeEventListener("touchstart", onFirstInteraction);
      clearTimeout(timeoutId);
    };

    window.addEventListener("pointerdown", onFirstInteraction, { passive: true });
    window.addEventListener("keydown", onFirstInteraction);
    window.addEventListener("scroll", onFirstInteraction, { passive: true });
    window.addEventListener("touchstart", onFirstInteraction, { passive: true });

    return cleanup;
  }, []);

  if (!shouldLoad) return null;
  return <CookieBannerUI />;
}