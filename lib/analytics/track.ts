// /lib/analytics/track.ts
"use client";

type TrackParams = Record<string, any>;

export function track(eventName: string, params: TrackParams = {}) {
  if (typeof window === "undefined") return;
  if (typeof window.gtag !== "function") return;

  const page_path = window.location?.pathname ?? "";
  const page_title = document?.title ?? "";

  window.gtag("event", eventName, {
    page_path,
    page_title,
    ...params,
  });
}