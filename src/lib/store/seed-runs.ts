import { getPlaybook } from "@/data/playbooks";
import { execute } from "@/lib/engine/executor";
import { between, createRandom } from "@/lib/engine/random";
import { samplePayload } from "@/lib/engine/samples";
import type { Run, Workflow } from "@/lib/engine/types";

const dayMs = 86_400_000;
const historyDays = 30;
const outageDaysAgo = 9;

export function seedRuns(
  workflows: Workflow[],
  now: number,
  seed = 20261110,
): Run[] {
  const random = createRandom(seed);
  const today = Math.floor(now / dayMs) * dayMs;
  const runs: Run[] = [];

  for (const workflow of workflows) {
    const playbook = workflow.playbook
      ? getPlaybook(workflow.playbook)
      : undefined;
    const perDay = (playbook?.monthlyVolume ?? 10) / historyDays;
    const createdAt = new Date(workflow.createdAt).getTime();
    const activeDays = workflow.enabled ? historyDays : 12;

    for (let daysAgo = historyDays; daysAgo >= 0; daysAgo--) {
      const dayStart = today - daysAgo * dayMs;
      if (dayStart < createdAt) continue;
      if (!workflow.enabled && daysAgo < historyDays - activeDays) continue;

      const count = Math.floor(perDay) + (random() < perDay % 1 ? 1 : 0);
      for (let index = 0; index < count; index++) {
        const hour = between(random, 7, 19);
        const startedAt =
          dayStart + hour * 3_600_000 + between(random, 0, 59) * 60_000;
        if (startedAt > now) continue;
        const runSeed = Math.floor(random() * 2 ** 31);
        const outage = daysAgo === outageDaysAgo && hour >= 10 && hour <= 16;
        const run = execute(
          workflow,
          samplePayload(workflow.trigger, runSeed, startedAt),
          {
            seed: runSeed,
            startedAt,
            runId: `run_${runSeed.toString(36)}`,
            failureRate: outage ? 0.85 : 0.02,
          },
        );
        if (run.finishedAt <= now) runs.push(run);
      }
    }
  }

  return runs.sort((a, b) => b.startedAt - a.startedAt);
}
