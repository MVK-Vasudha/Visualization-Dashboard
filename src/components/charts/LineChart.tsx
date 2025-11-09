import React, { useRef, useEffect, useMemo } from "react";

export type DataPoint = { timestamp: number; value: number };

interface LineChartProps {
  data: DataPoint[];
  // optional: color and whether to show points
  color?: string; // any valid CSS color
  showPointsThreshold?: number; // draw points if data.length <= threshold
  padding?: { left: number; right: number; top: number; bottom: number };
}

export function LineChart({
  data,
  color = "hsl(220 85% 55%)",
  showPointsThreshold = 1000,
  padding = { left: 24, right: 12, top: 12, bottom: 24 },
}: LineChartProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rAFRef = useRef<number | null>(null);
  const resizeObserver = useRef<ResizeObserver | null>(null);

  // compute bounds safely (memoize)
  const bounds = useMemo(() => {
    if (!data || data.length === 0) return null;
    let minT = Infinity,
      maxT = -Infinity,
      minV = Infinity,
      maxV = -Infinity;
    for (const p of data) {
      const t = Number(p.timestamp);
      const v = Number(p.value);
      if (!Number.isFinite(t) || !Number.isFinite(v)) continue;
      if (t < minT) minT = t;
      if (t > maxT) maxT = t;
      if (v < minV) minV = v;
      if (v > maxV) maxV = v;
    }
    if (!Number.isFinite(minT) || !Number.isFinite(maxT)) return null;
    // handle flat lines
    if (minV === Infinity || maxV === -Infinity) return null;
    if (minV === maxV) {
      // expand small delta so scale isn't zero
      minV = minV - 1;
      maxV = maxV + 1;
    }
    return { minT, maxT, minV, maxV };
  }, [data]);

  // scale helpers
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
    // invert y (canvas y increases downwards)
    return height - bottom - ((v - minV) / (maxV - minV || 1)) * innerH;
  };

  // draw function
  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas || !bounds) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Styles
    ctx.lineWidth = 2;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.strokeStyle = color;
    ctx.fillStyle = color;

    const width = canvas.width;
    const height = canvas.height;
    const left = padding.left;
    const right = padding.right;
    const top = padding.top;
    const bottom = padding.bottom;

    // path
    ctx.beginPath();
    let moved = false;
    for (let i = 0; i < data.length; i++) {
      const p = data[i];
      const x = scaleX(Number(p.timestamp), width, left, right);
      const y = scaleY(Number(p.value), height, top, bottom);
      if (!Number.isFinite(x) || !Number.isFinite(y)) continue;
      if (!moved) {
        ctx.moveTo(x, y);
        moved = true;
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.stroke();

    // points for small datasets
    if (data.length <= (showPointsThreshold ?? 1000)) {
      for (let i = 0; i < data.length; i++) {
        const p = data[i];
        const x = scaleX(Number(p.timestamp), width, left, right);
        const y = scaleY(Number(p.value), height, top, bottom);
        if (!Number.isFinite(x) || !Number.isFinite(y)) continue;
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  };

  // set up canvas pixel ratio and observer
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
        // scale the drawing context so 1 unit = 1 CSS pixel
        const ctx = canvas.getContext("2d");
        if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      }
      // schedule redraw
      if (rAFRef.current) cancelAnimationFrame(rAFRef.current);
      rAFRef.current = requestAnimationFrame(draw);
    };

    // initial set
    setSize();

    // observe parent size changes
    resizeObserver.current = new ResizeObserver(setSize);
    resizeObserver.current.observe(canvas);

    // also react to window DPR changes (resize handles it often)
    const onDPR = () => setSize();
    window.addEventListener("resize", onDPR);

    return () => {
      if (resizeObserver.current) {
        try {
          resizeObserver.current.disconnect();
        } catch {}
        resizeObserver.current = null;
      }
      window.removeEventListener("resize", onDPR);
      if (rAFRef.current) {
        cancelAnimationFrame(rAFRef.current);
        rAFRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canvasRef, bounds, color, padding, showPointsThreshold, data.length]);

  // redraw when data or bounds change
  useEffect(() => {
    if (rAFRef.current) cancelAnimationFrame(rAFRef.current);
    rAFRef.current = requestAnimationFrame(draw);
    return () => {
      if (rAFRef.current) cancelAnimationFrame(rAFRef.current);
      rAFRef.current = null;
    };
    // intentionally depend on data (shallow), bounds memo covers values
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, bounds]);

  // ensure parent has height — helper comment for devs:
  // The container must have a computed height (not zero). e.g. style={{height: 300}} or a flex container with fixed height.
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

