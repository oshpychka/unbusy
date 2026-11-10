"use client";

import {
  sankey,
  sankeyLinkHorizontal,
  type SankeyLink,
  type SankeyNode,
} from "d3-sankey";
import { useState } from "react";
import type { FlowLink, FlowNode } from "@/lib/engine/batch";
import { useElementWidth } from "@/hooks/useElementWidth";
import { ChartTooltip, type TooltipState } from "./ChartTooltip";

type Node = SankeyNode<FlowNode, FlowLink>;
type Link = SankeyLink<FlowNode, FlowLink>;

const minWidth = 640;
const height = 340;

function nodeClass(node: Node) {
  if (node.id === "end:failed") return "fill-chart-fail";
  if (node.id === "end:filtered") return "fill-muted";
  return "fill-chart";
}

export function SankeyChart({
  nodes,
  links,
  total,
}: {
  nodes: FlowNode[];
  links: FlowLink[];
  total: number;
}) {
  const [tip, setTip] = useState<TooltipState>(null);
  const [ref, measured] = useElementWidth<HTMLDivElement>(760);
  const width = Math.max(minWidth, measured);
  const graph = sankey<FlowNode, FlowLink>()
    .nodeId((node) => node.id)
    .nodeWidth(10)
    .nodePadding(18)
    .extent([
      [1, 8],
      [width - 1, height - 8],
    ])({
    nodes: nodes.map((node) => ({ ...node })),
    links: links.map((link) => ({ ...link })),
  });
  const path = sankeyLinkHorizontal<FlowNode, FlowLink>();
  const columns = [
    ...new Set(graph.nodes.map((node) => Math.round(node.x0 ?? 0))),
  ].sort((a, b) => a - b);
  const gap =
    columns.length > 1
      ? Math.min(...columns.slice(1).map((x, index) => x - columns[index]!))
      : width;
  const maxChars = Math.max(6, Math.floor((gap - 20) / 7));
  const fit = (text: string) =>
    text.length > maxChars ? `${text.slice(0, maxChars - 1).trimEnd()}…` : text;
  const nameOf = (value: Link["source"]) =>
    typeof value === "object" ? (value as Node).label : String(value);

  return (
    <figure className="flex flex-col gap-2">
      <figcaption className="text-sm font-semibold">
        How {total} records moved through the workflow
      </figcaption>
      <div
        ref={ref}
        className="relative overflow-x-auto"
        tabIndex={0}
        role="region"
        aria-label="Flow chart, scrollable"
        onPointerLeave={() => setTip(null)}
      >
        <svg
          viewBox={`0 0 ${width} ${height}`}
          width={width}
          height={height}
          className="block"
          role="img"
          aria-label="Flow of records through the workflow steps"
        >
          <g fill="none">
            {graph.links.map((link: Link, index) => {
              const target = link.target as Node;
              return (
                <path
                  key={index}
                  d={path(link) ?? ""}
                  strokeWidth={Math.max(1, link.width ?? 1)}
                  className={
                    target.id === "end:failed"
                      ? "stroke-chart-fail"
                      : "stroke-chart"
                  }
                  strokeOpacity={0.28}
                  onPointerEnter={(event) => {
                    const box =
                      event.currentTarget.ownerSVGElement!.parentElement!.getBoundingClientRect();
                    setTip({
                      x: event.clientX - box.left,
                      y: event.clientY - box.top,
                      title: `${nameOf(link.source)} to ${nameOf(link.target)}`,
                      lines: [`${link.value} of ${total} records`],
                    });
                  }}
                />
              );
            })}
          </g>
          {graph.nodes.map((node: Node) => {
            const x0 = node.x0 ?? 0;
            const x1 = node.x1 ?? 0;
            const y0 = node.y0 ?? 0;
            const y1 = node.y1 ?? 0;
            const right = node.kind === "end";
            return (
              <g key={node.id}>
                <rect
                  x={x0}
                  y={y0}
                  width={x1 - x0}
                  height={Math.max(2, y1 - y0)}
                  rx={2}
                  className={nodeClass(node)}
                />
                <text
                  x={right ? x0 - 6 : x1 + 6}
                  y={(y0 + y1) / 2}
                  dy="0.35em"
                  textAnchor={right ? "end" : "start"}
                  className="fill-text text-xs"
                >
                  <title>{`${node.label}: ${node.value}`}</title>
                  {fit(`${node.label} (${node.value})`)}
                </text>
              </g>
            );
          })}
        </svg>
        <ChartTooltip tip={tip} />
      </div>
    </figure>
  );
}
