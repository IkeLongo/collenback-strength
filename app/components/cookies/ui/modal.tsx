"use client";

import * as React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import "../cookies.css"
import { cn } from "@/lib/utils";

export type ModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  dismissable?: boolean; // click overlay / Esc
  className?: string; // content styles
};

export function Modal({
  open,
  onOpenChange,
  title,
  children,
  footer,
  dismissable = true,
  className,
}: ModalProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          onPointerDown={(e) => {
            if (!dismissable) e.preventDefault();
          }}
        />
        <Dialog.Content
          className={cn(
            "fixed left-1/2 top-1/2 w-[min(92vw,560px)] -translate-x-1/2 -translate-y-1/2",
            "rounded-lg bg-slate-950 text-white shadow-xl border border-white/10",
            "max-h-[80vh] z-50 overflow-x-auto",
            "focus:outline-none cookie-modal",
            className
          )}
          onEscapeKeyDown={(e) => {
            if (!dismissable) e.preventDefault();
          }}
          onPointerDownOutside={(e) => {
            if (!dismissable) e.preventDefault();
          }}
        >
          {title ? (
            <div className="px-5 pt-5 pb-3 border-b border-white/10">
              <Dialog.Title className="text-xl font-semibold">{title}</Dialog.Title>
            </div>
          ) : null}

          <div className="px-5 py-4 overflow-auto">{children}</div>

          {footer ? (
            <div className="px-5 py-4 border-t border-white/10">{footer}</div>
          ) : null}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}