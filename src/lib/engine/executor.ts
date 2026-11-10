import { evaluateAll } from "./conditions";
import { stepTitle } from "./describe";
import { renderValue, type Context } from "./expressions";
import { between, createRandom } from "./random";
import type { RateLimiter } from "./ratelimit";
import { SimulatedError, simulate } from "./simulate";
import type {
  ActionStep,
  DataRecord,
  Json,
  Run,
  Step,
  TraceEntry,
  Workflow,
} from "./types";

export type ExecuteOptions = {
  seed: number;
  startedAt: number;
  runId?: string;
  failureRate?: number;
  limiter?: RateLimiter;
};

type Outcome = "continue" | "failed" | "filtered";

const unitMs = { minutes: 60_000, hours: 3_600_000, days: 86_400_000 };
const maxLoopItems = 100;

export function execute(
  workflow: Workflow,
  payload: DataRecord,
  options: ExecuteOptions,
): Run {
  const random = createRandom(options.seed);
  const failureRate = options.failureRate ?? 0.03;
  const outputs: Record<string, DataRecord> = {};
  const trace: TraceEntry[] = [];
  let clock = options.startedAt;
  let recovered = 0;
  let runError: string | undefined;

  function context(item?: Json): Context {
    return {
      trigger: payload,
      steps: outputs,
      item,
      run: { now: new Date(clock).toISOString() },
    };
  }

  function record(entry: Omit<TraceEntry, "finishedAt">) {
    trace.push({ ...entry, finishedAt: clock });
  }

  function base(step: Step, path: string, input: DataRecord = {}) {
    return {
      stepId: step.id,
      path,
      startedAt: clock,
      input,
      attempts: 1,
      throttledMs: 0,
      waitedMs: 0,
    };
  }

  function runAction(
    step: ActionStep,
    path: string,
    item: Json | undefined,
  ): Outcome {
    const ctx = context(item);
    const input: DataRecord = {};
    for (const [key, template] of Object.entries(step.fields))
      input[key] = renderValue(template, ctx);

    const entry = base(step, path, input);
    const hasFallback = step.onError === "fallback";
    const retry = step.retry ?? workflow.settings.retry;
    const maxAttempts = 1 + Math.max(0, retry.attempts);
    let error: SimulatedError | undefined;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      entry.attempts = attempt;
      if (options.limiter) {
        const throttle = options.limiter.acquire(step.app, clock);
        entry.throttledMs += throttle.waitMs;
        clock += throttle.waitMs;
        if (throttle.rejected) {
          clock += between(random, 80, 200);
          error = new SimulatedError("429 Too Many Requests", true);
          if (attempt === maxAttempts) break;
          clock += retry.backoffMs * 2 ** (attempt - 1);
          continue;
        }
      }
      clock += between(random, 150, 900);
      try {
        const result = simulate(
          step.app,
          step.operation,
          input,
          random,
          context(item),
          failureRate,
        );
        outputs[step.id] = result.output;
        recovered += result.recovered ?? 0;
        record({
          ...entry,
          status: "ok",
          output: result.output,
          branch: hasFallback ? "success" : undefined,
        });
        return "continue";
      } catch (caught) {
        error =
          caught instanceof SimulatedError
            ? caught
            : new SimulatedError(String(caught), false);
        if (!error.transient || attempt === maxAttempts) break;
        clock += retry.backoffMs * 2 ** (attempt - 1);
      }
    }

    const message = error?.message ?? "Unknown error";
    record({
      ...entry,
      status: "failed",
      output: null,
      error: message,
      branch: hasFallback ? "fallback" : undefined,
    });
    const policy = step.onError ?? workflow.settings.onError;
    if (policy === "continue") return "continue";
    if (policy === "fallback")
      return runList(step.fallback ?? [], `${step.id}.fallback`, item);
    runError = `${stepTitle(step)}: ${message}`;
    return "failed";
  }

  function runStep(step: Step, path: string, item: Json | undefined): Outcome {
    const ctx = context(item);
    switch (step.type) {
      case "action":
        return runAction(step, path, item);
      case "if": {
        const result = evaluateAll(step.conditions, step.match, ctx);
        const branch = result ? "then" : "else";
        record({
          ...base(step, path),
          status: "ok",
          output: { result },
          branch,
        });
        return runList(
          result ? step.then : step.else,
          `${step.id}.${branch}`,
          item,
        );
      }
      case "switch": {
        const value = String(renderValue(step.value, ctx) ?? "")
          .trim()
          .toLowerCase();
        const match = step.cases.find(
          (option) => option.equals.trim().toLowerCase() === value,
        );
        const branch = match?.id ?? "otherwise";
        record({
          ...base(step, path, { value }),
          status: "ok",
          output: { matched: match?.label ?? "Otherwise" },
          branch,
        });
        return runList(
          match?.steps ?? step.otherwise,
          `${step.id}.${branch}`,
          item,
        );
      }
      case "filter": {
        const passed = evaluateAll(step.conditions, step.match, ctx);
        record({
          ...base(step, path),
          status: passed ? "ok" : "stopped",
          output: { passed },
        });
        return passed ? "continue" : "filtered";
      }
      case "delay": {
        const entry = base(step, path);
        let waitMs = step.amount * unitMs[step.unit];
        if (step.mode === "until") {
          const target = new Date(
            String(renderValue(step.until, ctx)),
          ).getTime();
          waitMs = Number.isNaN(target) ? 0 : Math.max(0, target - clock);
        }
        clock += waitMs;
        record({
          ...entry,
          waitedMs: waitMs,
          status: "ok",
          output: { resumed_at: new Date(clock).toISOString() },
        });
        return "continue";
      }
      case "transform": {
        const output: DataRecord = {};
        for (const assignment of step.assignments)
          output[assignment.key] = renderValue(assignment.value, ctx);
        outputs[step.id] = output;
        record({ ...base(step, path), status: "ok", output });
        return "continue";
      }
      case "loop": {
        const list = renderValue(step.list, ctx);
        const entry = base(step, path);
        if (!Array.isArray(list)) {
          record({
            ...entry,
            status: "failed",
            output: null,
            error: "Value is not a list",
          });
          runError = `${stepTitle(step)}: value is not a list`;
          return workflow.settings.onError === "continue"
            ? "continue"
            : "failed";
        }
        const items = list.slice(0, maxLoopItems);
        record({ ...entry, status: "ok", output: { count: items.length } });
        for (const [index, value] of items.entries()) {
          const outcome = runList(step.steps, `${step.id}[${index}]`, value);
          if (outcome !== "continue") return outcome;
        }
        return "continue";
      }
    }
  }

  function runList(
    steps: Step[],
    prefix: string,
    item: Json | undefined,
  ): Outcome {
    for (const [index, step] of steps.entries()) {
      const outcome = runStep(step, `${prefix}.${index}`, item);
      if (outcome !== "continue") return outcome;
    }
    return "continue";
  }

  const outcome = runList(workflow.steps, "root", undefined);

  return {
    id: options.runId ?? `run_${options.seed.toString(36)}`,
    workflowId: workflow.id,
    status:
      outcome === "failed"
        ? "failed"
        : outcome === "filtered"
          ? "filtered"
          : "success",
    startedAt: options.startedAt,
    finishedAt: clock,
    payload,
    trace,
    recovered,
    error: runError,
  };
}
