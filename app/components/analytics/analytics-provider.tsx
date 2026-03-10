// /app/components/analytics/AnalyticsProvider.tsx

"use client";

import React, { createContext, useCallback, useContext, useMemo } from "react";
import { track as trackFn } from "@/lib/analytics/track";

type TrackParams = Record<string, any>;
type AnalyticsContextValue = { track: (event: string, params?: TrackParams) => void };

const AnalyticsContext = createContext<AnalyticsContextValue | null>(null);

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const track = useCallback((event: string, params?: TrackParams) => {
    trackFn(event, params ?? {});
  }, []);

  const value = useMemo(() => ({ track }), [track]);
  return <AnalyticsContext.Provider value={value}>{children}</AnalyticsContext.Provider>;
}

export function useTrack() {
  return useContext(AnalyticsContext) ?? { track: (_e: string, _p?: TrackParams) => {} };
}