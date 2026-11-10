"use client";

import { useEffect, useId, useRef } from "react";
import { cn } from "@/lib/cn";
import { IconButton } from "./Button";

type DialogProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  variant?: "modal" | "sheet";
  className?: string;
  children: React.ReactNode;
};

export function Dialog({
  open,
  onClose,
  title,
  description,
  variant = "modal",
  className,
  children,
}: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
      document.documentElement.style.overflow = "hidden";
    } else if (!open && dialog.open) {
      dialog.close();
    }
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [open]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      aria-labelledby={titleId}
      className={cn(
        "m-0 max-h-none max-w-none border-line bg-surface p-0 text-text shadow-overlay backdrop:bg-overlay",
        variant === "modal"
          ? "inset-x-4 top-[10vh] mx-auto w-auto max-w-lg rounded-lg border sm:inset-x-0 sm:w-full"
          : "inset-x-0 top-auto bottom-0 w-full max-w-none rounded-t-lg border-t pb-[env(safe-area-inset-bottom)] md:inset-y-0 md:right-0 md:left-auto md:h-full md:max-h-none md:w-[420px] md:rounded-none md:border-t-0 md:border-l",
        className,
      )}
    >
      {open && (
        <div
          className={cn(
            "flex flex-col",
            variant === "sheet" && "max-h-[85dvh] md:h-full md:max-h-none",
          )}
        >
          <header className="flex items-start justify-between gap-4 border-b border-line px-5 py-4">
            <div>
              <h2 id={titleId} className="text-xl font-semibold">
                {title}
              </h2>
              {description && (
                <p className="mt-1 text-sm text-muted">{description}</p>
              )}
            </div>
            <IconButton
              icon="close"
              label="Close"
              size="sm"
              onClick={onClose}
              className="-mr-2"
            />
          </header>
          <div className="overflow-y-auto px-5 py-4">{children}</div>
        </div>
      )}
    </dialog>
  );
}
