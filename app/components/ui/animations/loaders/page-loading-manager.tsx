"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useLoading } from "./loading-context";

export default function PageLoadingManager() {
  const { setLoading } = useLoading();
  const pathname = usePathname();

  useEffect(() => {
    // Only keep loading state for the home page
    // All other pages should immediately set loading to false
    if (pathname !== '/') {
      setLoading(false);
    }
  }, [pathname, setLoading]);

  return null; // This component doesn't render anything
}