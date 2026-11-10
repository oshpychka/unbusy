"use client";

import { useEffect, useRef, useState } from "react";

type FitToWidthProps = {
  width: number;
  height: number;
  maxScale?: number;
  children: React.ReactNode;
};

export function FitToWidth({
  width,
  height,
  maxScale = 1,
  children,
}: FitToWidthProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => {
      if (entry) setScale(Math.min(maxScale, entry.contentRect.width / width));
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, [width, maxScale]);

  return (
    <div
      ref={ref}
      className="w-full overflow-hidden"
      style={{ height: height * scale }}
    >
      <div
        className="origin-top"
        style={{
          width,
          height,
          transform: `scale(${scale})`,
          marginLeft: `calc((100% - ${width}px) / 2)`,
        }}
      >
        {children}
      </div>
    </div>
  );
}
