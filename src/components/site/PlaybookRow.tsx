import Link from "next/link";
import { Icon, type IconName } from "@/components/ui/Icon";
import { getApp } from "@/data/apps";
import type { Playbook } from "@/data/playbooks";

export function PlaybookRow({ playbook }: { playbook: Playbook }) {
  const hours = Math.round(
    (playbook.manualMinutes * playbook.monthlyVolume) / 60,
  );
  return (
    <li className="group relative grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 py-5 sm:grid-cols-[auto_1fr_auto]">
      <span className="row-span-2 grid size-10 place-items-center rounded-md border border-line bg-surface text-muted transition-colors group-hover:border-primary group-hover:text-primary">
        <Icon name={getApp(playbook.trigger.app).icon as IconName} />
      </span>
      <Link
        href={`/playbooks/${playbook.slug}`}
        className="font-display text-lg font-semibold after:absolute after:inset-0"
      >
        {playbook.title}
      </Link>
      <p className="col-start-2 text-muted">{playbook.summary}</p>
      <span className="col-start-2 text-sm whitespace-nowrap text-muted sm:col-start-3 sm:row-span-2 sm:row-start-1 sm:self-center">
        about {hours} h a month
      </span>
    </li>
  );
}
