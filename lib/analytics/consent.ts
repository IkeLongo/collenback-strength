// /lib/analytics/consent.ts

export const COOKIE_KEY = "cookiePreferences";
export const CONSENT_EVENT = "cookie_consent_update";

export type CookiePrefs = {
  functional: boolean;
  statistical: boolean;
  marketing: boolean;
};

export function readCookiePrefs(): CookiePrefs | null {
  if (typeof document === "undefined") return null;

  try {
    const raw = document.cookie
      .split("; ")
      .find((r) => r.startsWith(`${COOKIE_KEY}=`))
      ?.split("=")[1];

    if (!raw) return null;

    const parsed = JSON.parse(decodeURIComponent(raw));
    if (
      typeof parsed?.functional === "boolean" &&
      typeof parsed?.statistical === "boolean" &&
      typeof parsed?.marketing === "boolean"
    ) {
      return parsed as CookiePrefs;
    }
    return null;
  } catch {
    return null;
  }
}