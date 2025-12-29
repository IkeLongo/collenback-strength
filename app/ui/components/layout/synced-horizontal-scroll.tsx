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
  const [enableDrag, setEnableDrag] = useState(false);

  // ✅ Only enable drag on "desktop-like" devices
  useEffect(() => {
    if (typeof window === "undefined") return;

    const mq = window.matchMedia("(pointer: fine) and (hover: hover)");
    const update = () => setEnableDrag(mq.matches);
    update();

    // Safari compatibility
    if (mq.addEventListener) mq.addEventListener("change", update);
    else mq.addListener(update);

    return () => {
      if (mq.removeEventListener) mq.removeEventListener("change", update);
      else mq.removeListener(update);
    };
  }, []);

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

  // ✅ Drag-to-scroll (DESKTOP ONLY), using Pointer Events so we can ignore touch
  useEffect(() => {
    const el = bodyRef.current;
    if (!el) return;

    // If not desktop-like, do nothing (native scroll on tablet/mobile)
    if (!enableDrag) {
      el.classList.remove("cursor-grab", "cursor-grabbing");
      return;
    }

    let isDown = false;
    let startX = 0;
    let startLeft = 0;
    let moved = false;
    let pointerId: number | null = null;

    const isInteractive = (target: EventTarget | null) => {
      if (!(target instanceof HTMLElement)) return false;
      return !!target.closest(
        "button, a, input, textarea, select, option, label, [role='button'], [data-no-drag]"
      );
    };

    const onDown = (e: PointerEvent) => {
      // ✅ only left click / primary button, and only mouse/pen (NOT touch)
      if (e.pointerType === "touch") return;
      if (typeof e.button === "number" && e.button !== 0) return;
      if (isInteractive(e.target)) return;

      isDown = true;
      moved = false;
      startX = e.pageX;
      startLeft = el.scrollLeft;
      pointerId = e.pointerId;

      // capture pointer so drag continues even if cursor leaves element
      el.setPointerCapture(pointerId);

      el.classList.add("cursor-grabbing");
      el.classList.remove("cursor-grab");
      document.body.classList.add("select-none");
    };

    const onMove = (e: PointerEvent) => {
      if (!isDown) return;
      if (pointerId !== null && e.pointerId !== pointerId) return;

      const dx = e.pageX - startX;
      if (Math.abs(dx) > 2) moved = true;
      el.scrollLeft = startLeft - dx;
    };

    const endDrag = () => {
      if (!isDown) return;
      isDown = false;

      el.classList.remove("cursor-grabbing");
      el.classList.add("cursor-grab");
      document.body.classList.remove("select-none");

      if (pointerId !== null) {
        try {
          el.releasePointerCapture(pointerId);
        } catch {}
      }
      pointerId = null;
    };

    const onUp = () => endDrag();
    const onCancel = () => endDrag();

    const onClickCapture = (e: MouseEvent) => {
      if (moved) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    el.classList.add("cursor-grab");
    el.addEventListener("pointerdown", onDown);
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerup", onUp);
    el.addEventListener("pointercancel", onCancel);
    el.addEventListener("click", onClickCapture, true);

    return () => {
      el.removeEventListener("pointerdown", onDown);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerup", onUp);
      el.removeEventListener("pointercancel", onCancel);
      el.removeEventListener("click", onClickCapture, true);
      document.body.classList.remove("select-none");
      el.classList.remove("cursor-grab", "cursor-grabbing");
    };
  }, [enableDrag]);

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
          className={cn(
            "overflow-x-auto overflow-y-hidden",
            // ✅ on mobile/tablet we want the normal feel
            !enableDrag && "touch-pan-x"
          )}
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
