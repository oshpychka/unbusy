"use client";

import { create } from "zustand";
import { cn } from "@/lib/cn";
import { Icon } from "./Icon";

type Toast = {
  id: number;
  message: string;
  tone: "default" | "success" | "danger";
};

type ToastState = {
  toasts: Toast[];
  push: (message: string, tone?: Toast["tone"]) => void;
  dismiss: (id: number) => void;
};

let nextId = 1;

export const useToasts = create<ToastState>((set, get) => ({
  toasts: [],
  push: (message, tone = "default") => {
    const id = nextId++;
    set({ toasts: [...get().toasts.slice(-2), { id, message, tone }] });
    window.setTimeout(() => get().dismiss(id), 4000);
  },
  dismiss: (id) =>
    set({ toasts: get().toasts.filter((toast) => toast.id !== id) }),
}));

export function toast(message: string, tone?: Toast["tone"]) {
  useToasts.getState().push(message, tone);
}

export function Toaster() {
  const toasts = useToasts((state) => state.toasts);
  const dismiss = useToasts((state) => state.dismiss);

  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed inset-x-4 bottom-[calc(5rem+env(safe-area-inset-bottom))] z-50 flex flex-col items-center gap-2 md:right-6 md:bottom-6 md:left-auto md:items-end"
    >
      {toasts.map((item) => (
        <div
          key={item.id}
          className="pointer-events-auto flex w-full max-w-sm items-center gap-3 rounded-md border border-line bg-surface py-2 pr-2 pl-3 text-sm shadow-overlay"
        >
          <span
            aria-hidden
            className={cn(
              "size-2 shrink-0 rounded-full",
              item.tone === "success"
                ? "bg-success"
                : item.tone === "danger"
                  ? "bg-danger"
                  : "bg-primary",
            )}
          />
          <span className="flex-1">{item.message}</span>
          <button
            type="button"
            onClick={() => dismiss(item.id)}
            aria-label="Dismiss"
            className="grid size-8 place-items-center rounded-sm text-muted hover:bg-sunken hover:text-text"
          >
            <Icon name="close" size={16} />
          </button>
        </div>
      ))}
    </div>
  );
}
