"use client";

import { useEffect, useRef, useState } from "react";
import { ButtonLink, IconButton } from "@/components/ui/Button";
import { NavLink } from "./NavLink";
import { siteNav } from "./nav-links";

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open) {
      dialog.showModal();
      document.documentElement.style.overflow = "hidden";
    } else if (dialog.open) {
      dialog.close();
    }
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [open]);

  function close() {
    setOpen(false);
    buttonRef.current?.focus();
  }

  return (
    <>
      <IconButton
        ref={buttonRef}
        icon="menu"
        label="Open menu"
        aria-expanded={open}
        onClick={() => setOpen(true)}
        className="md:hidden"
      />
      <dialog
        ref={dialogRef}
        onCancel={(event) => {
          event.preventDefault();
          close();
        }}
        aria-label="Menu"
        className="m-0 h-dvh max-h-none w-full max-w-none bg-bg p-0 text-text"
      >
        <div className="flex h-16 items-center justify-between border-b border-line px-4">
          <span className="font-display text-xl font-bold">Menu</span>
          <IconButton icon="close" label="Close menu" onClick={close} />
        </div>
        <nav aria-label="Mobile" className="px-4 py-6">
          <ul className="flex flex-col">
            {siteNav.map((item) => (
              <li key={item.href} className="border-b border-line">
                <NavLink
                  href={item.href}
                  onClick={close}
                  className="flex min-h-14 items-center text-xl"
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
          <ButtonLink
            href="/app"
            size="lg"
            className="mt-8 w-full"
            onClick={close}
          >
            Open the demo
          </ButtonLink>
        </nav>
      </dialog>
    </>
  );
}
