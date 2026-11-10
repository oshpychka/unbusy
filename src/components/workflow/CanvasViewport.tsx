"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { IconButton } from "@/components/ui/Button";

type View = { x: number; y: number; scale: number };

type CanvasViewportProps = {
  contentWidth: number;
  contentHeight: number;
  fitKey: string;
  children: React.ReactNode;
};

const minScale = 0.3;
const maxScale = 1.6;

function clamp(value: number) {
  return Math.min(maxScale, Math.max(minScale, value));
}

export function CanvasViewport({
  contentWidth,
  contentHeight,
  fitKey,
  children,
}: CanvasViewportProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [view, setView] = useState<View>({ x: 0, y: 0, scale: 1 });
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const pinch = useRef<{ distance: number; scale: number } | null>(null);
  const size = useRef({ width: contentWidth, height: contentHeight });
  size.current = { width: contentWidth, height: contentHeight };

  const fit = useCallback(() => {
    const box = ref.current?.getBoundingClientRect();
    if (!box) return;
    const scale = clamp(
      Math.min(
        1,
        (box.width - 32) / size.current.width,
        (box.height - 32) / size.current.height,
      ),
    );
    setView({ scale, x: (box.width - size.current.width * scale) / 2, y: 16 });
  }, []);

  useEffect(() => {
    fit();
  }, [fit, fitKey]);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      if (event.ctrlKey || event.metaKey) {
        const box = element.getBoundingClientRect();
        zoomAt(
          Math.exp(-event.deltaY * 0.01),
          event.clientX - box.left,
          event.clientY - box.top,
        );
      } else {
        setView((current) => ({
          ...current,
          x: current.x - event.deltaX,
          y: current.y - event.deltaY,
        }));
      }
    };
    element.addEventListener("wheel", onWheel, { passive: false });
    return () => element.removeEventListener("wheel", onWheel);
  }, []);

  function zoomAt(factor: number, originX: number, originY: number) {
    setView((current) => {
      const scale = clamp(current.scale * factor);
      const ratio = scale / current.scale;
      return {
        scale,
        x: originX - (originX - current.x) * ratio,
        y: originY - (originY - current.y) * ratio,
      };
    });
  }

  function zoomCenter(factor: number) {
    const box = ref.current?.getBoundingClientRect();
    if (box) zoomAt(factor, box.width / 2, box.height / 2);
  }

  function onPointerDown(event: React.PointerEvent) {
    if ((event.target as HTMLElement).closest("button")) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    pointers.current.set(event.pointerId, {
      x: event.clientX,
      y: event.clientY,
    });
    if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()];
      pinch.current = {
        distance: Math.hypot(a!.x - b!.x, a!.y - b!.y),
        scale: view.scale,
      };
    }
  }

  function onPointerMove(event: React.PointerEvent) {
    const previous = pointers.current.get(event.pointerId);
    if (!previous) return;
    pointers.current.set(event.pointerId, {
      x: event.clientX,
      y: event.clientY,
    });
    if (pointers.current.size === 2 && pinch.current) {
      const [a, b] = [...pointers.current.values()];
      const distance = Math.hypot(a!.x - b!.x, a!.y - b!.y);
      const box = ref.current!.getBoundingClientRect();
      const factor =
        (pinch.current.scale * (distance / pinch.current.distance)) /
        view.scale;
      zoomAt(factor, (a!.x + b!.x) / 2 - box.left, (a!.y + b!.y) / 2 - box.top);
      return;
    }
    setView((current) => ({
      ...current,
      x: current.x + event.clientX - previous.x,
      y: current.y + event.clientY - previous.y,
    }));
  }

  function onPointerUp(event: React.PointerEvent) {
    pointers.current.delete(event.pointerId);
    if (pointers.current.size < 2) pinch.current = null;
  }

  return (
    <div
      ref={ref}
      className="dot-grid relative h-full w-full cursor-grab touch-none overflow-hidden select-none active:cursor-grabbing"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      <div
        className="absolute top-0 left-0 origin-top-left"
        style={{
          transform: `translate(${view.x}px, ${view.y}px) scale(${view.scale})`,
        }}
      >
        {children}
      </div>
      <div className="absolute right-3 bottom-3 flex items-center gap-0.5 rounded-md border border-line bg-surface p-0.5">
        <IconButton
          icon="zoomOut"
          label="Zoom out"
          size="sm"
          onClick={() => zoomCenter(1 / 1.2)}
        />
        <span className="w-12 text-center text-xs text-muted tabular-nums">
          {Math.round(view.scale * 100)}%
        </span>
        <IconButton
          icon="zoomIn"
          label="Zoom in"
          size="sm"
          onClick={() => zoomCenter(1.2)}
        />
        <IconButton icon="fit" label="Fit to screen" size="sm" onClick={fit} />
      </div>
    </div>
  );
}
