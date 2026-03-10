// /app/components/analytics/AnalyticsGA4.tsx

"use client";

import Script from "next/script";
import { useEffect } from "react";
import Cookies from "js-cookie";

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

type CookiePrefs = {
  preferences: boolean;
  analytics: boolean;
};

const COOKIE_KEY = "cookiePreferences";

function safeParsePrefs(raw: string | undefined): CookiePrefs | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (
      typeof parsed?.preferences === "boolean" &&
      typeof parsed?.analytics === "boolean"
    ) {
      return parsed as CookiePrefs;
    }
    return null;
  } catch {
    return null;
  }
}

export default function AnalyticsGA4() {
  // 1) Listen for consent updates (from banner/modal)
  useEffect(() => {
    const onConsentUpdate = (e: Event) => {
      const detail = (e as CustomEvent<CookiePrefs>).detail;
      if (!detail) return;

      window.gtag?.("consent", "update", {
        analytics_storage: detail.analytics ? "granted" : "denied",
        ad_storage: "denied",
        ad_user_data: "denied",
        ad_personalization: "denied"
      });
    };

    window.addEventListener("cookie_consent_update", onConsentUpdate as EventListener);
    return () => {
      window.removeEventListener("cookie_consent_update", onConsentUpdate as EventListener);
    };
  }, []);

  // 2) Upgrade immediately if consent already exists
  useEffect(() => {
    const prefs = safeParsePrefs(Cookies.get(COOKIE_KEY));
    if (!prefs) return;

    window.gtag?.("consent", "update", {
      analytics_storage: prefs.analytics ? "granted" : "denied",
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied"
    });
  }, []);

  if (!GA_ID) return null;

  return (
    <>
      {/* MUST run first */}
      <Script id="ga-consent-defaults" strategy="beforeInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          window.gtag = gtag;

          // Advanced Consent Mode: Sends cookieless pings even when denied
          gtag('consent', 'default', {
            analytics_storage: 'denied',
            ad_storage: 'denied',
            ad_user_data: 'denied',
            ad_personalization: 'denied',
            functionality_storage: 'granted',
            security_storage: 'granted',
            wait_for_update: 500,
            url_passthrough: true,
            ads_data_redaction: true
          });
        `}
      </Script>

      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />

      <Script id="ga-init" strategy="afterInteractive">
        {`
          gtag('js', new Date());
          gtag('config', '${GA_ID}', {
            anonymize_ip: true,
            allow_google_signals: false,
            send_page_view: true
          });
        `}
      </Script>
    </>
  );
}
