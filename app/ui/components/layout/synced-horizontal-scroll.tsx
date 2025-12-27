"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { cn } from "@/app/lib/utils";

export function SyncedHorizontalScroll({
  children,
}: {
  children: React.ReactNode;
}) {
  const topRef = useRef<HTMLDivElement | null>(null);
  const topInnerRef = useRef<HTMLDivElement | null>(null);
  const bodyRef = useRef<HTMLDivElement | null>(null);

  const syncing = useRef(false);
  const [showTop, setShowTop] = useState(false);

  const syncSizes = useCallback(() => {
    const body = bodyRef.current;
    const topInner = topInnerRef.current;
    if (!body || !topInner) return;

    topInner.style.width = `${body.scrollWidth}px`;
    setShowTop(body.scrollWidth > body.clientWidth + 1);
  }, []);

  useEffect(() => {
    syncSizes();

    const body = bodyRef.current;
    if (!body) return;

    const ro = new ResizeObserver(() => syncSizes());
    ro.observe(body);

    const mo = new MutationObserver(() => syncSizes());
    mo.observe(body, { childList: true, subtree: true });

    window.addEventListener("resize", syncSizes);

    return () => {
      ro.disconnect();
      mo.disconnect();
      window.removeEventListener("resize", syncSizes);
    };
  }, [syncSizes]);

  function onTopScroll() {
    if (syncing.current) return;
    const top = topRef.current;
    const body = bodyRef.current;
    if (!top || !body) return;

    syncing.current = true;
    body.scrollLeft = top.scrollLeft;
    requestAnimationFrame(() => (syncing.current = false));
  }

  function onBodyScroll() {
    if (syncing.current) return;
    const top = topRef.current;
    const body = bodyRef.current;
    if (!top || !body) return;

    syncing.current = true;
    top.scrollLeft = body.scrollLeft;
    requestAnimationFrame(() => (syncing.current = false));
  }

  // Drag-to-scroll (mouse) — improved to not fight with buttons/links/inputs
  useEffect(() => {
    const el = bodyRef.current;
    if (!el) return;

    let isDown = false;
    let startX = 0;
    let startLeft = 0;
    let moved = false;

    const isInteractive = (target: EventTarget | null) => {
      if (!(target instanceof HTMLElement)) return false;
      return !!target.closest(
        "button, a, input, textarea, select, option, label, [role='button'], [data-no-drag]"
      );
    };

    const onDown = (e: MouseEvent) => {
      if (e.button !== 0) return; // left click only
      if (isInteractive(e.target)) return; // don't hijack clicks on controls

      isDown = true;
      moved = false;
      startX = e.pageX;
      startLeft = el.scrollLeft;

      // UX polish
      el.classList.add("cursor-grabbing");
      el.classList.remove("cursor-grab");
      document.body.classList.add("select-none"); // tailwind class
    };

    const onMove = (e: MouseEvent) => {
      if (!isDown) return;

      const dx = e.pageX - startX;
      if (Math.abs(dx) > 2) moved = true; // small threshold
      el.scrollLeft = startLeft - dx;
    };

    const onUp = () => {
      if (!isDown) return;
      isDown = false;

      el.classList.remove("cursor-grabbing");
      el.classList.add("cursor-grab");
      document.body.classList.remove("select-none");
    };

    const onClickCapture = (e: MouseEvent) => {
      // If user dragged, prevent accidental click (like on a row button)
      if (moved) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    el.classList.add("cursor-grab");
    el.addEventListener("mousedown", onDown);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);

    // capture clicks inside the scroll area (optional but feels right)
    el.addEventListener("click", onClickCapture, true);

    return () => {
      el.removeEventListener("mousedown", onDown);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      el.removeEventListener("click", onClickCapture, true);
      document.body.classList.remove("select-none");
    };
  }, []);

  return (
    <div className="relative">
      {/* Sticky top scrollbar */}
      <div
        className={cn(
          "sticky top-0 z-10 border-b border-grey-200 bg-white",
          showTop ? "block" : "hidden"
        )}
      >
        <div
          ref={topRef}
          onScroll={onTopScroll}
          className="h-4 overflow-x-auto overflow-y-hidden"
        >
          <div ref={topInnerRef} className="h-1" />
        </div>
      </div>

      {/* Main scroll area */}
      <div className="relative">
        <div
          ref={bodyRef}
          onScroll={onBodyScroll}
          className="overflow-x-auto overflow-y-hidden"
          style={{
            scrollbarGutter: "stable",
            WebkitOverflowScrolling: "touch",
          }}
        >
          {children}
        </div>

        {/* Overlays live OUTSIDE the scroll container so they don’t move */}
        {showTop && (
          <>
            <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-8 bg-gradient-to-r from-white to-transparent" />
            <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-8 bg-gradient-to-l from-white to-transparent" />
          </>
        )}
      </div>
    </div>
  );
}