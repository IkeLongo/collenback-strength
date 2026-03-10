"use client";

import * as React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import "../cookies.css"
import { cn } from "@/lib/utils";

export type DrawerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  dismissable?: boolean;
  className?: string;
};

export function Drawer({
  open,
  onOpenChange,
  title,
  children,
  footer,
  dismissable = true,
  className,
}: DrawerProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        {/* Optional overlay; keep it for focus/a11y, but prevent dismissal if needed */}
        <Dialog.Overlay
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          onPointerDown={(e) => {
            if (!dismissable) e.preventDefault();
          }}
        />

        <Dialog.Content
          className={cn(
            "fixed inset-x-0 bottom-0 z-50",
            "rounded-t-2xl bg-slate-950 text-white shadow-2xl border-t border-white/10",
            "focus:outline-none cookie-drawer",
            className
          )}
          onEscapeKeyDown={(e) => {
            if (!dismissable) e.preventDefault();
          }}
          onPointerDownOutside={(e) => {
            if (!dismissable) e.preventDefault();
          }}
        >
          <div className="mx-auto max-w-3xl">
            {/* little handle */}
            <div className="flex justify-center pt-2">
              <div className="h-1.5 w-10 rounded-full bg-white/20" />
            </div>

            {title ? (
              <div className="px-5 pt-4 pb-2">
                <Dialog.Title className="text-2xl font-semibold">{title}</Dialog.Title>
              </div>
            ) : null}

            <div className="px-5 pb-4">{children}</div>

            {footer ? (
              <div className="px-5 py-4 border-t border-white/10">{footer}</div>
            ) : null}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}