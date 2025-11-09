import { useEffect, useRef, useCallback } from 'react';
import { DataPoint, ChartBounds } from '@/lib/types';
import {
  setupCanvas,
  getCanvasContext,
  clearCanvas,
  drawAxes,
  drawGrid,
  calculateChartBounds,
  updateBoundsFromData,
} from '@/lib/canvasUtils';

export function useChartRenderer(
  data: DataPoint[],
  renderChart: (
    ctx: CanvasRenderingContext2D,
    data: DataPoint[],
    bounds: ChartBounds,
    isDark: boolean
  ) => void
) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const boundsRef = useRef<ChartBounds | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = getCanvasContext(canvas);
    const rect = canvas.getBoundingClientRect();
    
    if (!boundsRef.current || 
        boundsRef.current.width !== rect.width || 
        boundsRef.current.height !== rect.height) {
      setupCanvas(canvas, rect.width, rect.height);
      boundsRef.current = calculateChartBounds(rect.width, rect.height);
    }
    
    const bounds = updateBoundsFromData(boundsRef.current, data);
    const isDark = document.documentElement.classList.contains('dark');
    
    clearCanvas(ctx, rect.width, rect.height);
    drawGrid(ctx, bounds, isDark);
    drawAxes(ctx, bounds, isDark);
    renderChart(ctx, data, bounds, isDark);
  }, [data, renderChart]);
  
  useEffect(() => {
    const animate = () => {
      render();
      animationFrameRef.current = requestAnimationFrame(animate);
    };
    
    animationFrameRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [render]);
  
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      const rect = canvas.getBoundingClientRect();
      setupCanvas(canvas, rect.width, rect.height);
      boundsRef.current = calculateChartBounds(rect.width, rect.height);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  return canvasRef;
}
