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
  size?: "md" | "lg";
  className?: string;
  children: React.ReactNode;
};

export function Dialog({
  open,
  onClose,
  title,
  description,
  variant = "modal",
  size = "md",
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
        "m-0 border-line bg-surface p-0 text-text shadow-overlay backdrop:bg-overlay",
        variant === "modal"
          ? cn(
              "inset-x-4 top-[6vh] mx-auto max-h-[88dvh] w-auto overflow-y-auto rounded-lg border sm:inset-x-0 sm:w-full",
              size === "lg" ? "max-w-5xl" : "max-w-lg",
            )
          : "inset-x-0 top-auto bottom-0 max-h-none w-full max-w-none rounded-t-lg border-t pb-[env(safe-area-inset-bottom)] md:inset-y-0 md:right-0 md:left-auto md:h-full md:max-h-none md:w-[420px] md:rounded-none md:border-t-0 md:border-l",
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
