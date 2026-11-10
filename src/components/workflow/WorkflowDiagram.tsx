import { cn } from "@/lib/cn";
import type { Slot } from "@/lib/engine/edit";
import type { Step, Trigger } from "@/lib/engine/types";
import { findStep } from "@/lib/engine/edit";
import { edgeTaken, type RunPath } from "@/lib/run-path";
import {
  layoutWorkflow,
  nodeHeight,
  nodeWidth,
  type Point,
} from "@/lib/workflow-layout";
import { Icon } from "@/components/ui/Icon";
import { StepCard, type StepCardState } from "./StepCard";
import { stepMeta, triggerMeta } from "./step-meta";

const padding = 40;

type WorkflowDiagramProps = {
  trigger: Trigger;
  steps: Step[];
  path?: RunPath;
  activeStep?: string | null;
  selected?: string | null;
  warnings?: Set<string>;
  onSelect?: (id: string) => void;
  onInsert?: (slot: Slot) => void;
};

function toPath(points: Point[]) {
  return points
    .map((point, index) => `${index ? "L" : "M"}${point.x} ${point.y}`)
    .join(" ");
}

export function diagramSize(steps: Step[]) {
  const { bounds } = layoutWorkflow(steps);
  return {
    width: bounds.maxX - bounds.minX + padding * 2,
    height: bounds.maxY + padding * 2,
    offsetX: -bounds.minX + padding,
  };
}

export function WorkflowDiagram({
  trigger,
  steps,
  path,
  activeStep,
  selected,
  warnings,
  onSelect,
  onInsert,
}: WorkflowDiagramProps) {
  const layout = layoutWorkflow(steps);
  const { width, height, offsetX } = diagramSize(steps);
  const shift = (point: Point) => ({
    x: point.x + offsetX,
    y: point.y + padding,
  });

  function stateOf(id: string): StepCardState {
    if (activeStep === id) return "active";
    if (!path) return "idle";
    const status = path.steps.get(id);
    if (!status) return path.steps.size ? "skipped" : "idle";
    return status === "failed" ? "failed" : "ok";
  }

  return (
    <div className="relative" style={{ width, height }}>
      <svg
        width={width}
        height={height}
        className="absolute inset-0"
        aria-hidden
      >
        {layout.edges.map((edge) => {
          const taken = path ? edgeTaken(edge, path) : false;
          return (
            <path
              key={edge.key}
              d={toPath(edge.points.map(shift))}
              fill="none"
              strokeWidth={taken ? 2 : 1.5}
              className={cn(
                "transition-colors duration-300",
                taken ? "stroke-signal" : "stroke-line-strong",
              )}
              strokeLinejoin="round"
            />
          );
        })}
      </svg>

      {layout.edges.map((edge) => {
        if (!edge.label) return null;
        const point = shift(edge.points[edge.points.length - 1]!);
        return (
          <span
            key={`${edge.key}-label`}
            className="absolute rounded-sm border border-line bg-bg px-1.5 text-xs font-medium whitespace-nowrap text-muted"
            style={{ left: point.x + 18, top: point.y - 26 }}
          >
            {edge.label}
          </span>
        );
      })}

      {layout.placeholders.map((item) => {
        const point = shift(item);
        const style = {
          left: point.x - 70,
          top: point.y,
          width: 140,
          height: 44,
        };
        const className =
          "absolute grid place-items-center rounded-md border border-dashed border-line-strong text-xs text-muted";
        return onInsert ? (
          <button
            key={item.key}
            type="button"
            onClick={() => onInsert(item.slot)}
            className={cn(
              className,
              "bg-surface hover:border-primary hover:text-primary",
            )}
            style={style}
          >
            Add a step
          </button>
        ) : (
          <span key={item.key} className={cn(className, "bg-bg")} style={style}>
            Nothing happens
          </span>
        );
      })}

      {layout.nodes.map((node) => {
        const id = node.stepId ?? "trigger";
        const step = node.stepId ? findStep(steps, node.stepId) : null;
        const meta = step ? stepMeta(step) : triggerMeta(trigger);
        const state = node.stepId
          ? stateOf(node.stepId)
          : path?.steps.size
            ? "ok"
            : "idle";
        const card = (
          <StepCard
            {...meta}
            state={state}
            selected={selected === id}
            warning={warnings?.has(id)}
          />
        );
        const style = {
          left: node.x + offsetX,
          top: node.y + padding,
          width: nodeWidth,
          height: nodeHeight,
        };
        return onSelect ? (
          <button
            key={node.key}
            type="button"
            data-step={id}
            onClick={() => onSelect(id)}
            aria-pressed={selected === id}
            aria-label={`${meta.kicker}: ${meta.title}`}
            className="absolute rounded-md"
            style={style}
          >
            {card}
          </button>
        ) : (
          <div key={node.key} className="absolute" style={style}>
            {card}
          </div>
        );
      })}

      {onInsert &&
        layout.edges.map((edge) => {
          if (!edge.plus || !edge.slot) return null;
          const point = shift(edge.plus);
          const slot = edge.slot;
          return (
            <button
              key={`${edge.key}-plus`}
              type="button"
              onClick={() => onInsert(slot)}
              aria-label="Add a step here"
              title="Add a step here"
              className="absolute grid size-6 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-line-strong bg-surface text-muted transition-colors hover:border-primary hover:bg-primary hover:text-on-primary"
              style={{ left: point.x, top: point.y }}
            >
              <Icon name="plus" size={14} />
            </button>
          );
        })}
    </div>
  );
}
