// /lib/analytics/events.ts
"use client";

import { track } from "@/lib/analytics/track";

export function trackCtaClick(params: {
  cta_id: string;
  label: string;
  location: string;
  href?: string;
}) {
  track("cta_click", params);
}

export function trackFormAttempt(params: { form_id: string; location: string }) {
  track("form_submit_attempt", params);
}

export function trackFormSuccess(params: { form_id: string; location: string }) {
  track("form_submit_success", params);
}

export function trackCheckoutStart(params: {
  product_id: string;
  value?: number;
  currency?: string;
}) {
  track("checkout_start", { currency: "USD", ...params });
}