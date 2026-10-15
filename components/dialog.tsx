"use client";

import { useLayoutEffect, useRef, type ReactNode } from "react";

// Native <dialog>: focus trapping, Esc to close, and inert background come from the browser.
export function Dialog({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);

  useLayoutEffect(() => {
    const dialog = ref.current;
    if (!dialog || !open) return;
    dialog.showModal();
    // Also runs when Next hides this page with <Activity>; a modal left open would make the next page inert.
    return () => dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => e.target === e.currentTarget && onClose()}
      className="m-auto w-[calc(100%-2rem)] max-w-md rounded-2xl bg-white p-0 text-slate-900 shadow-2xl backdrop:bg-slate-950/40 backdrop:backdrop-blur-sm"
    >
      <div className="p-6">
        <h2 className="text-lg font-semibold">{title}</h2>
        <div className="mt-3 text-sm text-slate-600">{children}</div>
      </div>
    </dialog>
  );
}
