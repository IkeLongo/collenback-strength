"use client";

import { useEffect, useMemo, useState } from "react";
import { Modal } from "../ui/modal";
import { Button } from "../ui/button";
import { Switch } from "../ui/switch";
import { DEFAULT_PREFS, readPrefs, writePrefs } from "../lib/consent";
import type { CookiePrefs } from "@/types/cookies";

export type PreferencesModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function CookiePreferences({ isOpen, onClose }: PreferencesModalProps) {
  const [isNecessary] = useState(true);

  const [preferences, setPreferences] = useState(DEFAULT_PREFS.preferences);
  const [analytics, setAnalytics] = useState(DEFAULT_PREFS.analytics);
  // const [marketing, setMarketing] = useState(DEFAULT_PREFS.marketing);

  // Load current prefs each time modal opens
  useEffect(() => {
    if (!isOpen) return;
    const existing = readPrefs();
    const prefs = existing ?? DEFAULT_PREFS;

    setPreferences(prefs.preferences);
    setAnalytics(prefs.analytics);
    // setMarketing(prefs.marketing);
  }, [isOpen]);

  const currentPrefs: CookiePrefs = useMemo(
    () => ({ preferences, analytics }),
    [preferences, analytics]
  );

  const saveAndClose = () => {
    writePrefs(currentPrefs);
    onClose();
  };

  return (
    <Modal
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      dismissable={false}
      title={<span className="font-semibold">Cookies &amp; Your Privacy</span>}
      className="z-50"
      footer={
        <div className="flex gap-2">
          <Button variant="solid" onClick={saveAndClose}>
            OK
          </Button>
          <Button variant="bordered" onClick={saveAndClose}>
            Save Settings
          </Button>
        </div>
      }
    >
      <div className="space-y-4 text-white">
        <p>
          We use cookies to understand how visitors use our website and to ensure the site functions properly.
        </p>

        <ol className="list-decimal list-inside space-y-1">
          <li>
            <strong>Ensure core site functionality</strong> (preferences cookies)
          </li>
          <li>
            <strong>Measure website usage and performance</strong> using Google Analytics and Microsoft Clarity (analytics cookies)
          </li>
        </ol>

        <p>
          We do not use advertising or marketing cookies.
        </p>

        <p>
          Analytics data helps us understand general site usage so we can improve the experience for visitors.
        </p>

        <p>
          You can customize your preferences below and click <strong>Save settings</strong>.
        </p>

        <p>
          You may adjust or withdraw your consent anytime by clicking the links at the bottom of the page.
          For more details, please review our{" "}
          <a href="/privacy" className="text-blue-300 hover:underline" onClick={onClose}>
            Privacy Policy
          </a>{" "}
          and{" "}
          <a href="/privacy#cookie-policy" className="text-blue-300 hover:underline" onClick={onClose}>
            Cookie Policy
          </a>.
        </p>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <div className="flex flex-col items-center gap-2">
            <p className="text-center text-sm">Strictly Necessary</p>
            <Switch checked={isNecessary} onCheckedChange={() => {}} disabled aria-label="Strictly necessary" />
          </div>

          <div className="flex flex-col items-center gap-2">
            <p className="text-sm">Preferences</p>
            <Switch checked={preferences} onCheckedChange={setPreferences} aria-label="Preferences cookies" />
          </div>

          <div className="flex flex-col items-center gap-2">
            <p className="text-sm">Analytics</p>
            <Switch checked={analytics} onCheckedChange={setAnalytics} aria-label="Analytics cookies" />
          </div>

          {/* <div className="flex flex-col items-center gap-2">
            <p className="text-sm">Marketing</p>
            <Switch checked={marketing} onCheckedChange={setMarketing} aria-label="Marketing cookies" />
          </div> */}
        </div>
      </div>
    </Modal>
  );
}