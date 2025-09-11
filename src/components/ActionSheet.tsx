// ===============================
// src/components/ActionSheet.tsx
// ===============================
import React, { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";


export type ActionSheetProps = {
open: boolean;
onClose: () => void;
title?: string;
children: React.ReactNode;
footer?: React.ReactNode;
maxHeight?: number | string; // e.g. '80vh'
initialFocusRef?: React.RefObject<HTMLElement>;
};


export function ActionSheet({ open, onClose, title, children, footer, maxHeight = "80vh", initialFocusRef }: ActionSheetProps) {
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
return () => {
document.body.style.overflow = "";
};
}, [open]);


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
e.preventDefault();
first.focus();
} else if (document.activeElement === first && e.shiftKey) {
e.preventDefault();
last.focus();
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
onMouseDown={(e) => {
if (e.target === overlayRef.current) onClose();
}}
}
