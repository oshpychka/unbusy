"use client";

import { useSyncExternalStore } from "react";
import { Icon } from "@/components/ui/Icon";
import { storageWorks } from "@/lib/store/storage";

const subscribe = () => () => {};

export function StorageNotice() {
  const works = useSyncExternalStore(subscribe, storageWorks, () => true);
  if (works) return null;
  return (
    <p
      role="status"
      className="flex items-start gap-2 border-b border-line bg-sunken px-4 py-2 text-sm text-warning sm:px-6"
    >
      <Icon name="info" size={18} className="mt-0.5 shrink-0" />
      This browser is blocking site storage, so your changes will be lost when
      you close the tab.
    </p>
  );
}
