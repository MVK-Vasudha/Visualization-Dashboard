import { DataPoint, ChartBounds } from './types';

export function getCanvasContext(canvas: HTMLCanvasElement): CanvasRenderingContext2D {
  const ctx = canvas.getContext('2d', {
    alpha: false,
    desynchronized: true, // Performance optimization
  });
  
  if (!ctx) throw new Error('Canvas context not available');
  
  return ctx;
}

export function setupCanvas(
  canvas: HTMLCanvasElement,
  width: number,
  height: number,
  dpr: number = window.devicePixelRatio || 1
): void {
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  
  const ctx = getCanvasContext(canvas);
  ctx.scale(dpr, dpr);
}

export function calculateChartBounds(
  width: number,
  height: number,
  paddingLeft = 60,
  paddingRight = 20,
  paddingTop = 20,
  paddingBottom = 40
): ChartBounds {
  const data: DataPoint[] = [];
  
  return {
    minX: 0,
    maxX: 100,
    minY: 0,
    maxY: 200,
    width: width - paddingLeft - paddingRight,
    height: height - paddingTop - paddingBottom,
    paddingLeft,
    paddingRight,
    paddingTop,
    paddingBottom,
  };
}

export function updateBoundsFromData(
  bounds: ChartBounds,
  data: DataPoint[]
): ChartBounds {
  if (data.length === 0) return bounds;
  
  const timestamps = data.map(d => d.timestamp);
  const values = data.map(d => d.value);
  
  return {
    ...bounds,
    minX: Math.min(...timestamps),
    maxX: Math.max(...timestamps),
    minY: Math.min(...values) * 0.95,
    maxY: Math.max(...values) * 1.05,
  };
}

export function scaleX(value: number, bounds: ChartBounds): number {
  const { minX, maxX, width, paddingLeft } = bounds;
  return paddingLeft + ((value - minX) / (maxX - minX)) * width;
}

export function scaleY(value: number, bounds: ChartBounds): number {
  const { minY, maxY, height, paddingTop } = bounds;
  return paddingTop + height - ((value - minY) / (maxY - minY)) * height;
}

export function clearCanvas(ctx: CanvasRenderingContext2D, width: number, height: number): void {
  ctx.fillStyle = 'hsl(var(--background))';
  ctx.fillRect(0, 0, width, height);
}

export function drawAxes(
  ctx: CanvasRenderingContext2D,
  bounds: ChartBounds,
  isDark: boolean
): void {
  const { paddingLeft, paddingTop, width, height } = bounds;
  
  ctx.strokeStyle = isDark ? 'hsl(var(--border))' : 'hsl(var(--border))';
  ctx.lineWidth = 1;
  
  // Y-axis
  ctx.beginPath();
  ctx.moveTo(paddingLeft, paddingTop);
  ctx.lineTo(paddingLeft, paddingTop + height);
  ctx.stroke();
  
  // X-axis
  ctx.beginPath();
  ctx.moveTo(paddingLeft, paddingTop + height);
  ctx.lineTo(paddingLeft + width, paddingTop + height);
  ctx.stroke();
}

export function drawGrid(
  ctx: CanvasRenderingContext2D,
  bounds: ChartBounds,
  isDark: boolean
): void {
  const { paddingLeft, paddingTop, width, height } = bounds;
  const gridLines = 5;
  
  ctx.strokeStyle = isDark ? 'hsl(var(--border) / 0.2)' : 'hsl(var(--border) / 0.2)';
  ctx.lineWidth = 1;
  
  // Horizontal grid lines
  for (let i = 0; i <= gridLines; i++) {
    const y = paddingTop + (height / gridLines) * i;
    ctx.beginPath();
    ctx.moveTo(paddingLeft, y);
    ctx.lineTo(paddingLeft + width, y);
    ctx.stroke();
  }
  
  // Vertical grid lines
  for (let i = 0; i <= gridLines; i++) {
    const x = paddingLeft + (width / gridLines) * i;
    ctx.beginPath();
    ctx.moveTo(x, paddingTop);
    ctx.lineTo(x, paddingTop + height);
    ctx.stroke();
  }
}
