"use client";

import Link from "next/link";
import { Button } from "./Button";
import { Icon } from "./Icon";

type ErrorStateProps = {
  reset: () => void;
  home: string;
  homeLabel: string;
  extra?: React.ReactNode;
};

export function ErrorState({ reset, home, homeLabel, extra }: ErrorStateProps) {
  return (
    <div
      role="alert"
      className="mx-auto flex max-w-lg flex-col items-start gap-4 py-16"
    >
      <span className="grid size-11 place-items-center rounded-md border border-line bg-surface text-danger">
        <Icon name="alert" />
      </span>
      <h1 className="text-2xl font-bold">Something broke on this page</h1>
      <p className="text-muted">
        The rest of the app still works. Try again, and if the same thing
        happens, go back and continue from there.
      </p>
      <div className="flex flex-wrap gap-2">
        <Button onClick={reset}>Try again</Button>
        <Link
          href={home}
          className="inline-flex min-h-11 items-center px-3 text-primary underline"
        >
          {homeLabel}
        </Link>
      </div>
      {extra}
    </div>
  );
}
