import React, { useRef, useEffect, useMemo } from "react";

export type DataPoint = {
  timestamp: number | string;
  value: number;
  category?: string;
};

interface ScatterPlotProps {
  data: DataPoint[];
  color?: string;
  categoryColors?: Record<string, string>;
  padding?: { left: number; right: number; top: number; bottom: number };
}

export function ScatterPlot({
  data,
  color = "hsl(220 85% 55%)",
  categoryColors,
  padding = { left: 24, right: 12, top: 12, bottom: 24 },
}: ScatterPlotProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rAFRef = useRef<number | null>(null);
  const resizeObserver = useRef<ResizeObserver | null>(null);

  const defaultCategoryColors: Record<string, string> = {
    A: "hsl(0 70% 50%)",
    B: "hsl(120 70% 50%)",
    C: "hsl(240 70% 50%)",
    D: "hsl(60 70% 50%)",
    E: "hsl(300 70% 50%)",
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
    return { minT, maxT, minV, maxV };
  }, [data]);

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas || !bounds) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const dpr = Math.max(1, window.devicePixelRatio || 1);
    const cssWidth = canvas.width / dpr;
    const cssHeight = canvas.height / dpr;

    const left = padding.left;
    const right = padding.right;
    const top = padding.top;
    const bottom = padding.bottom;

    const innerW = Math.max(1, cssWidth - left - right);
    const innerH = Math.max(1, cssHeight - top - bottom);

    const scaleX = (t: number) => {
      const { minT, maxT } = bounds;
      return ((t - minT) / (maxT - minT || 1)) * innerW + left;
    };
    const scaleY = (v: number) => {
      const { minV, maxV } = bounds;
      return cssHeight - bottom - ((v - minV) / (maxV - minV || 1)) * innerH;
    };

    const pointSize =
      data.length > 10000 ? 1.25 : data.length > 5000 ? 1.75 : data.length > 1000 ? 2.5 : 4;

    ctx.lineWidth = 0.5;
    ctx.lineJoin = "round";

    for (let i = 0; i < data.length; i++) {
      const p = data[i];
      const t = typeof p.timestamp === "string" ? Date.parse(p.timestamp) : Number(p.timestamp);
      const v = Number(p.value);
      if (!Number.isFinite(t) || !Number.isFinite(v)) continue;

      const x = scaleX(t);
      const y = scaleY(v);

      const fill = (p.category && colors[p.category]) || color;
      ctx.fillStyle = fill;
      ctx.beginPath();
      ctx.arc(x, y, pointSize, 0, Math.PI * 2);
      ctx.fill();
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
  }, [canvasRef, padding, data.length, bounds]);

  useEffect(() => {
    if (rAFRef.current) cancelAnimationFrame(rAFRef.current);
    rAFRef.current = requestAnimationFrame(draw);
    return () => {
      if (rAFRef.current) cancelAnimationFrame(rAFRef.current);
      rAFRef.current = null;
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
