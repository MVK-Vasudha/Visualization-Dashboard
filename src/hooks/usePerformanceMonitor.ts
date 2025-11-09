import { useState, useEffect, useRef } from 'react';
import { PerformanceMetrics } from '@/lib/types';
import { PerformanceMonitor } from '@/lib/performanceUtils';

export function usePerformanceMonitor() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fps: 60,
    memoryUsage: 0,
    renderTime: 0,
    dataProcessingTime: 0,
    frameDrops: 0,
  });
  
  const monitorRef = useRef<PerformanceMonitor>(new PerformanceMonitor());
  
  useEffect(() => {
    let animationFrameId: number;
    
    const updateMetrics = () => {
      monitorRef.current.startFrame();
      setMetrics(monitorRef.current.getMetrics());
      animationFrameId = requestAnimationFrame(updateMetrics);
    };
    
    animationFrameId = requestAnimationFrame(updateMetrics);
    
    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, []);
  
  return { metrics, monitor: monitorRef.current };
}
