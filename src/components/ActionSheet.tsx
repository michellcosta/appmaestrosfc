import React, { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

export type ActionSheetProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxHeight?: number | string; // '80vh'
  initialFocusRef?: React.RefObject<HTMLElement>;
};

export function ActionSheet({
  open,
  onClose,
  title,
  children,
  footer,
  maxHeight = "80vh",
  initialFocusRef,
}: ActionSheetProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const lastActive = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (open) {
      lastActive.current = (document.activeElement as HTMLElement) ?? null;
      const toFocus = initialFocusRef?.current || sheetRef.current;
      toFocus?.focus();
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      lastActive.current?.focus?.();
    }
    return () => { document.body.style.overflow = ""; };
  }, [open, initialFocusRef]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (!open) return;
      if (e.key === "Escape") onClose();
      if (e.key === "Tab") {
        const focusables = sheetRef.current?.querySelectorAll<HTMLElement>(
          'a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])'
        );
        if (!focusables || focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (document.activeElement === last && !e.shiftKey) {
          e.preventDefault(); first.focus();
        } else if (document.activeElement === first && e.shiftKey) {
          e.preventDefault(); last.focus();
        }
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-end bg-black/50 backdrop-blur-[1px]"
      aria-hidden={!open}
      onMouseDown={(e) => { if (e.target === overlayRef.current) onClose(); }}
    >
      <div
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        tabIndex={-1}
        className="w-full rounded-t-2xl bg-background shadow-2xl outline-none animate-in slide-in-from-bottom duration-200"
        style={{ maxHeight }}
      >
        <div className="flex items-center gap-3 p-4 border-b relative">
          <div className="h-1.5 w-12 rounded-full bg-muted mx-auto absolute left-1/2 -translate-x-1/2 -top-2" />
          <h2 className="text-lg font-semibold flex-1 text-center">{title}</h2>
          <button
            className="p-2 rounded-full hover:bg-muted/60 active:scale-95 transition"
            aria-label="Fechar"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="overflow-y-auto" style={{ maxHeight }}>
          <div className="p-4">{children}</div>
        </div>

        {footer && <div className="p-4 border-t bg-muted/20">{footer}</div>}
      </div>
    </div>,
    document.body
  );
}
