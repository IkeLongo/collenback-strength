"use client";

import React, { useState } from "react";
import CookiePreferences from "./CookiePreferences";

export default function CookiePreferencesLink() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        className="underline underline-offset-4 hover:opacity-80"
        onClick={() => setOpen(true)}
      >
        Cookie Settings
      </button>

      <CookiePreferences isOpen={open} onClose={() => setOpen(false)} />
    </>
  );
}