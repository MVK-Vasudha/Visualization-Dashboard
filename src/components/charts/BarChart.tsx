import React, { useRef, useEffect, useMemo } from "react";

export type DataPoint = {
  timestamp: number | string;
  value: number;
  category?: string;
};

interface BarChartProps {
  data: DataPoint[];
  color?: string;
  categoryColors?: Record<string, string>;
  padding?: { left: number; right: number; top: number; bottom: number };
  minBarWidth?: number;
}

export function BarChart({
  data,
  color = "hsl(220 85% 55%)",
  categoryColors,
  padding = { left: 24, right: 12, top: 12, bottom: 24 },
  minBarWidth = 3,
}: BarChartProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rAFRef = useRef<number | null>(null);
  const resizeObserver = useRef<ResizeObserver | null>(null);

  const defaultCategoryColors: Record<string, string> = {
    A: "#3b82f6",
    B: "#10b981",
    C: "#f59e0b",
    D: "#ef4444",
    E: "#8b5cf6",
  };

  const colors = useMemo(
    () => ({ ...defaultCategoryColors, ...(categoryColors ?? {}) }),
    [categoryColors]
  );

  const bounds = useMemo(() => {
    if (!data || data.length === 0) return null;
    let minT = Infinity,
      maxT = -Infinity,
      minV = Infinity,
      maxV = -Infinity;
    for (const p of data) {
      const tN =
        typeof p.timestamp === "string"
          ? Date.parse(p.timestamp)
          : Number(p.timestamp);
      const vN = Number(p.value);
      if (!Number.isFinite(tN) || !Number.isFinite(vN)) continue;
      if (tN < minT) minT = tN;
      if (tN > maxT) maxT = tN;
      if (vN < minV) minV = vN;
      if (vN > maxV) maxV = vN;
    }
    if (!Number.isFinite(minT) || !Number.isFinite(maxT)) return null;
    if (!Number.isFinite(minV) || !Number.isFinite(maxV)) return null;
    if (minV === maxV) {
      minV = minV - 1;
      maxV = maxV + 1;
    }
    if (minT === maxT) {
      minT = minT - 1;
      maxT = maxT + 1;
    }
    return { minT, maxT, minV, maxV };
  }, [data]);

  const scaleX = (t: number, width: number, left: number, right: number) => {
    if (!bounds) return 0;
    const { minT, maxT } = bounds;
    const innerW = Math.max(1, width - left - right);
    return ((t - minT) / (maxT - minT || 1)) * innerW + left;
  };

  const scaleY = (v: number, height: number, top: number, bottom: number) => {
    if (!bounds) return 0;
    const { minV, maxV } = bounds;
    const innerH = Math.max(1, height - top - bottom);
    return height - bottom - ((v - minV) / (maxV - minV || 1)) * innerH;
  };

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas || !bounds) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.lineJoin = "round";
    ctx.lineCap = "round";

    const width = canvas.width;
    const height = canvas.height;
    const left = padding.left;
    const right = padding.right;
    const top = padding.top;
    const bottom = padding.bottom;

    const innerW = Math.max(1, width - left - right);
    const perBar = innerW / Math.max(1, data.length);
    const barWidth = Math.max(minBarWidth, perBar - 2);

    for (let i = 0; i < data.length; i++) {
      const p = data[i];
      const tN =
        typeof p.timestamp === "string"
          ? Date.parse(p.timestamp)
          : Number(p.timestamp);
      const vN = Number(p.value);
      if (!Number.isFinite(tN) || !Number.isFinite(vN)) continue;

      const xCenter = scaleX(tN, width, left, right);
      const yTop = scaleY(vN, height, top, bottom);
      const yBase = scaleY(bounds.minV, height, top, bottom);
      const h = Math.max(1, yBase - yTop);

      const fill = (p.category && colors[p.category]) || color;
      ctx.fillStyle = fill;

      const xLeft = xCenter - barWidth / 2;
      ctx.fillRect(xLeft, yTop, barWidth, h);

      if (data.length < 500) {
        ctx.strokeStyle = "rgba(0,0,0,0.12)";
        ctx.lineWidth = 0.5;
        ctx.strokeRect(xLeft + 0.25, yTop + 0.25, barWidth - 0.5, h - 0.5);
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
  }, [canvasRef, padding, minBarWidth, color, JSON.stringify(colors)]);

  useEffect(() => {
    if (rAFRef.current) cancelAnimationFrame(rAFRef.current);
    rAFRef.current = requestAnimationFrame(draw);
    return () => {
      if (rAFRef.current) {
        cancelAnimationFrame(rAFRef.current);
        rAFRef.current = null;
      }
    };
  }, [data, bounds]);

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
