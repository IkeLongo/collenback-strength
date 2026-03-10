"use client";

import { useEffect, useState } from "react";
import { Drawer } from "../ui/drawer";
import { Button } from "../ui/button";
import CookiePreferences from "./CookiePreferences";
import { DEFAULT_PREFS, readPrefs, writePrefs } from "../lib/consent";

export default function CookieBannerUI() {
  const [showBanner, setShowBanner] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);

  useEffect(() => {
    const existing = readPrefs();
    if (!existing) setShowBanner(true);
  }, []);

  const acceptAllCookies = () => {
    writePrefs({ preferences: true, analytics: true });
    setShowBanner(false);
  };

  const rejectNonEssential = () => {
    writePrefs(DEFAULT_PREFS);
    setShowBanner(false);
  };

  const configureCookies = () => {
    setShowBanner(false);
    setShowPreferences(true);
  };

  return (
    <>
      <CookiePreferences isOpen={showPreferences} onClose={() => setShowPreferences(false)} />

      <Drawer
        open={showBanner}
        onOpenChange={(open) => {
          // do not allow closing without a choice
          if (!open) setShowBanner(true);
        }}
        dismissable={false}
        title={<span className="">We Respect Your Privacy</span>}
        className="fixed"
        footer={
          <div className="flex flex-wrap gap-2">
            <Button variant="solid" onClick={acceptAllCookies}>
              Accept All
            </Button>
            <Button variant="bordered" onClick={rejectNonEssential}>
              Reject Non-Essential
            </Button>
            <Button variant="bordered" className="border-green-500" onClick={configureCookies}>
              Configure Cookies
            </Button>
          </div>
        }
      >
        <p className="text-left">
          We use cookies to ensure the website functions properly and, with 
          your permission, to analyze how visitors use the site using tools 
          like Google Analytics and Microsoft Clarity. This helps us understand 
          site performance and improve the user experience. We do not use cookies 
          for advertising or marketing purposes, and we do not sell visitor data.
        </p>
      </Drawer>
    </>
  );
}