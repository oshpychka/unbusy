import { branchKeys, listFor, type Slot } from "@/lib/engine/edit";
import type { Step } from "@/lib/engine/types";

export const nodeWidth = 248;
export const nodeHeight = 68;
const gapY = 64;
const gapX = 32;
const emptyHeight = 44;

export type Point = { x: number; y: number };
export type LayoutNode = {
  key: string;
  stepId: string | null;
  x: number;
  y: number;
};
export type LayoutEdge = {
  key: string;
  points: Point[];
  plus?: Point;
  slot?: Slot;
  label?: string;
  toStep?: string;
  branch?: { stepId: string; key: string };
};
export type LayoutPlaceholder = {
  key: string;
  x: number;
  y: number;
  slot: Slot;
  branch: { stepId: string; key: string };
};
export type Layout = {
  nodes: LayoutNode[];
  edges: LayoutEdge[];
  placeholders: LayoutPlaceholder[];
  bounds: { minX: number; maxX: number; maxY: number };
};

function branchLabel(step: Step, key: string) {
  if (step.type === "if") return key === "then" ? "Yes" : "No";
  if (step.type === "switch")
    return key === "otherwise"
      ? "Otherwise"
      : step.cases.find((item) => item.id === key)?.label;
  if (step.type === "loop") return "For each";
  return "On error";
}

function widthOfList(steps: Step[]): number {
  return steps.length ? Math.max(...steps.map(widthOfStep)) : nodeWidth;
}

function visibleBranches(step: Step) {
  return branchKeys(step).filter(
    (key) => !(step.type === "action" && key === "fallback"),
  );
}

function widthOfStep(step: Step): number {
  const keys = visibleBranches(step);
  if (keys.length === 0) return nodeWidth;
  const total =
    keys.reduce((sum, key) => sum + widthOfList(listFor(step, key) ?? []), 0) +
    gapX * (keys.length - 1);
  return Math.max(nodeWidth, total);
}

function elbow(from: Point, to: Point): Point[] {
  if (from.x === to.x) return [from, to];
  const midY = from.y + gapY / 2;
  return [from, { x: from.x, y: midY }, { x: to.x, y: midY }, to];
}

function plusOn(points: Point[]): Point {
  const end = points[points.length - 1]!;
  const before = points[points.length - 2]!;
  return { x: end.x, y: (before.y + end.y) / 2 };
}

export function layoutWorkflow(steps: Step[]): Layout {
  const nodes: LayoutNode[] = [
    { key: "trigger", stepId: null, x: -nodeWidth / 2, y: 0 },
  ];
  const edges: LayoutEdge[] = [];
  const placeholders: LayoutPlaceholder[] = [];
  let minX = -nodeWidth / 2;
  let maxX = nodeWidth / 2;
  let maxY = nodeHeight;

  function track(x: number, y: number) {
    minX = Math.min(minX, x - nodeWidth / 2);
    maxX = Math.max(maxX, x + nodeWidth / 2);
    maxY = Math.max(maxY, y);
  }

  function placeList(
    list: Step[],
    cx: number,
    from: Point,
    top: number,
    parentId: string | null,
    branch: string,
    branchInfo?: { stepId: string; key: string; label?: string },
  ): { exit: Point; tail: Slot } {
    if (list.length === 0 && branchInfo) {
      const slot = { parentId, branch, index: 0 };
      const points = elbow(from, { x: cx, y: top });
      edges.push({
        key: `${parentId}.${branch}.in`,
        points,
        label: branchInfo.label,
        branch: branchInfo,
      });
      placeholders.push({
        key: `${parentId}.${branch}.empty`,
        x: cx,
        y: top,
        slot,
        branch: branchInfo,
      });
      track(cx, top + emptyHeight);
      return { exit: { x: cx, y: top + emptyHeight }, tail: slot };
    }

    let previous = from;
    let y = top;
    for (const [index, step] of list.entries()) {
      const points = elbow(previous, { x: cx, y });
      edges.push({
        key: `${parentId}.${branch}.${index}`,
        points,
        plus: plusOn(points),
        slot: { parentId, branch, index },
        label: index === 0 ? branchInfo?.label : undefined,
        toStep: step.id,
        branch: index === 0 && branchInfo ? branchInfo : undefined,
      });
      previous = placeStep(step, cx, y);
      y = previous.y + gapY;
    }
    return { exit: previous, tail: { parentId, branch, index: list.length } };
  }

  function placeStep(step: Step, cx: number, y: number): Point {
    nodes.push({ key: step.id, stepId: step.id, x: cx - nodeWidth / 2, y });
    track(cx, y + nodeHeight);
    const bottom = { x: cx, y: y + nodeHeight };
    const keys = visibleBranches(step);
    if (keys.length === 0) return bottom;

    const widths = keys.map((key) => widthOfList(listFor(step, key) ?? []));
    const total =
      widths.reduce((sum, width) => sum + width, 0) + gapX * (keys.length - 1);
    let left = cx - total / 2;
    const exits = keys.map((key, index) => {
      const width = widths[index]!;
      const childX = left + width / 2;
      left += width + gapX;
      const info = { stepId: step.id, key, label: branchLabel(step, key) };
      return {
        key,
        ...placeList(
          listFor(step, key) ?? [],
          childX,
          bottom,
          bottom.y + gapY,
          step.id,
          key,
          info,
        ),
      };
    });

    const mergeY = Math.max(...exits.map((item) => item.exit.y)) + gapY / 2;
    const merge = { x: cx, y: mergeY };
    for (const item of exits) {
      const points: Point[] =
        item.exit.x === cx
          ? [item.exit, merge]
          : [item.exit, { x: item.exit.x, y: mergeY }, merge];
      edges.push({
        key: `${step.id}.${item.key}.out`,
        points,
        plus: { x: item.exit.x, y: (item.exit.y + mergeY) / 2 },
        slot: item.tail,
        branch: { stepId: step.id, key: item.key },
      });
    }
    track(cx, mergeY);
    return merge;
  }

  const { exit, tail } = placeList(
    steps,
    0,
    { x: 0, y: nodeHeight },
    nodeHeight + gapY,
    null,
    "root",
  );
  const end = { x: 0, y: exit.y + gapY * 0.8 };
  edges.push({ key: "root.end", points: [exit, end], plus: end, slot: tail });
  track(0, end.y + 24);

  return { nodes, edges, placeholders, bounds: { minX, maxX, maxY } };
}
