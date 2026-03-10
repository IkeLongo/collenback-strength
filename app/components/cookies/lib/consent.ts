import Cookies from "js-cookie";

import type { CookiePrefs } from "@/types/cookies";

export const COOKIE_KEY = "cookiePreferences";
export const COOKIE_EXPIRES_DAYS = 365;

// Consent-mode safe defaults
export const DEFAULT_PREFS: CookiePrefs = {
  preferences: true,
  analytics: false,
  // marketing: false,
};

export function safeParsePrefs(raw: string | undefined): CookiePrefs | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (
      typeof parsed?.preferences === "boolean" &&
      typeof parsed?.analytics === "boolean" // &&
      // typeof parsed?.marketing === "boolean"
    ) {
      return parsed as CookiePrefs;
    }
    return null;
  } catch {
    return null;
  }
}

export function readPrefs(): CookiePrefs | null {
  return safeParsePrefs(Cookies.get(COOKIE_KEY));
}

export function hasPrefs(): boolean {
  return Boolean(readPrefs());
}

export function writePrefs(prefs: CookiePrefs) {
  Cookies.set(COOKIE_KEY, JSON.stringify(prefs), {
    expires: COOKIE_EXPIRES_DAYS,
    path: "/",
    sameSite: "Lax",
    secure: true,
  });

  // 1) CustomEvent (for GA gating component)
  window.dispatchEvent(new CustomEvent("cookie_consent_update", { detail: prefs }));

  // 2) Optional: dataLayer for GTM setups
  (window as any).dataLayer = (window as any).dataLayer || [];
  (window as any).dataLayer.push({
    event: "cookie_consent_update",
    cookiePreferences: prefs,
  });
}