import React, { useRef, useEffect, useMemo } from "react";

export type DataPoint = {
  timestamp: number | string;
  value: number;
};

interface HeatmapProps {
  data: DataPoint[];
  gridSize?: number;
  padding?: { left: number; right: number; top: number; bottom: number };
}

export function Heatmap({
  data,
  gridSize = 50,
  padding = { left: 12, right: 12, top: 12, bottom: 12 },
}: HeatmapProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rAFRef = useRef<number | null>(null);
  const resizeObserver = useRef<ResizeObserver | null>(null);

  const bounds = useMemo(() => {
    if (!data || data.length === 0) return null;
    let minT = Infinity,
      maxT = -Infinity,
      minV = Infinity,
      maxV = -Infinity;
    for (const p of data) {
      const t = typeof p.timestamp === "string" ? Date.parse(p.timestamp) : Number(p.timestamp);
      const v = Number(p.value);
      if (!Number.isFinite(t) || !Number.isFinite(v)) continue;
      if (t < minT) minT = t;
      if (t > maxT) maxT = t;
      if (v < minV) minV = v;
      if (v > maxV) maxV = v;
    }
    if (!Number.isFinite(minT) || !Number.isFinite(maxT) || !Number.isFinite(minV) || !Number.isFinite(maxV)) return null;
    if (minT === maxT) {
      minT = minT - 1;
      maxT = maxT + 1;
    }
    if (minV === maxV) {
      minV = minV - 1;
      maxV = maxV + 1;
    }
    return { minT, maxT, minV, maxV, paddingLeft: padding.left, paddingTop: padding.top };
  }, [data, padding]);

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas || !bounds) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const dpr = Math.max(1, window.devicePixelRatio || 1);
    const cssWidth = canvas.width / dpr;
    const cssHeight = canvas.height / dpr;

    const availableWidth = Math.max(1, cssWidth - (padding.left + padding.right));
    const availableHeight = Math.max(1, cssHeight - (padding.top + padding.bottom));
    const cellWidth = availableWidth / gridSize;
    const cellHeight = availableHeight / gridSize;

    const grid: number[][] = Array.from({ length: gridSize }, () => new Array(gridSize).fill(0));

    const { minT, maxT, minV, maxV } = bounds;

    for (let i = 0; i < data.length; i++) {
      const p = data[i];
      const t = typeof p.timestamp === "string" ? Date.parse(p.timestamp) : Number(p.timestamp);
      const v = Number(p.value);
      if (!Number.isFinite(t) || !Number.isFinite(v)) continue;
      const xIdx = Math.floor(((t - minT) / (maxT - minT || 1)) * (gridSize - 1));
      const yIdx = Math.floor(((v - minV) / (maxV - minV || 1)) * (gridSize - 1));
      if (xIdx >= 0 && xIdx < gridSize && yIdx >= 0 && yIdx < gridSize) {
        grid[gridSize - 1 - yIdx][xIdx] += 1;
      }
    }

    let maxCount = 0;
    for (let y = 0; y < gridSize; y++) {
      for (let x = 0; x < gridSize; x++) {
        if (grid[y][x] > maxCount) maxCount = grid[y][x];
      }
    }
    if (maxCount === 0) return;

    for (let y = 0; y < gridSize; y++) {
      for (let x = 0; x < gridSize; x++) {
        const count = grid[y][x];
        if (count === 0) continue;
        const intensity = Math.min(1, count / maxCount);
        const hue = 240 - intensity * 240;
        const alpha = Math.min(0.85, intensity * 0.85);
        ctx.fillStyle = `hsla(${hue}, 70%, 50%, ${alpha})`;
        const px = padding.left + x * cellWidth;
        const py = padding.top + y * cellHeight;
        ctx.fillRect(px, py, cellWidth + 0.5, cellHeight + 0.5);
      }
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const setSize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.max(1, window.devicePixelRatio || 1);
      const w = Math.round(rect.width * dpr);
      const h = Math.round(rect.height * dpr);
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      }
      if (rAFRef.current) cancelAnimationFrame(rAFRef.current);
      rAFRef.current = requestAnimationFrame(draw);
    };

    setSize();

    resizeObserver.current = new ResizeObserver(setSize);
    resizeObserver.current.observe(canvas);

    const onResize = () => setSize();
    window.addEventListener("resize", onResize);

    return () => {
      if (resizeObserver.current) {
        try {
          resizeObserver.current.disconnect();
        } catch {}
        resizeObserver.current = null;
      }
      window.removeEventListener("resize", onResize);
      if (rAFRef.current) {
        cancelAnimationFrame(rAFRef.current);
        rAFRef.current = null;
      }
    };
  }, [canvasRef, gridSize, padding, data.length, bounds]);

  useEffect(() => {
    if (rAFRef.current) cancelAnimationFrame(rAFRef.current);
    rAFRef.current = requestAnimationFrame(draw);
    return () => {
      if (rAFRef.current) cancelAnimationFrame(rAFRef.current);
      rAFRef.current = null;
    };
  }, [data, bounds, gridSize]);

  return (
    <div className="w-full h-full" style={{ minHeight: 200 }}>
      <canvas
        ref={canvasRef}
        style={{
          width: "100%",
          height: "100%",
          display: "block",
        }}
      />
    </div>
  );
}
