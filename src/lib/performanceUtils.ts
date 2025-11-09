import { PerformanceMetrics } from './types';

export class PerformanceMonitor {
  private frameTimes: number[] = [];
  private lastFrameTime = performance.now();
  private frameCount = 0;
  private frameDrops = 0;
  private renderStartTime = 0;
  private dataProcessStartTime = 0;
  
  startFrame(): void {
    const now = performance.now();
    const delta = now - this.lastFrameTime;
    
    this.frameTimes.push(delta);
    if (this.frameTimes.length > 60) {
      this.frameTimes.shift();
    }
    
    // Count frame drops (> 16.67ms = below 60fps)
    if (delta > 16.67) {
      this.frameDrops++;
    }
    
    this.lastFrameTime = now;
    this.frameCount++;
  }
  
  startRender(): void {
    this.renderStartTime = performance.now();
  }
  
  endRender(): number {
    return performance.now() - this.renderStartTime;
  }
  
  startDataProcessing(): void {
    this.dataProcessStartTime = performance.now();
  }
  
  endDataProcessing(): number {
    return performance.now() - this.dataProcessStartTime;
  }
  
  getMetrics(): PerformanceMetrics {
    const avgFrameTime = this.frameTimes.reduce((a, b) => a + b, 0) / this.frameTimes.length || 0;
    const fps = avgFrameTime > 0 ? 1000 / avgFrameTime : 60;
    
    // Get memory usage if available
    let memoryUsage = 0;
    if ('memory' in performance) {
      memoryUsage = (performance as any).memory.usedJSHeapSize / (1024 * 1024); // MB
    }
    
    return {
      fps: Math.round(fps * 10) / 10,
      memoryUsage: Math.round(memoryUsage * 10) / 10,
      renderTime: this.endRender(),
      dataProcessingTime: this.endDataProcessing(),
      frameDrops: this.frameDrops,
    };
  }
  
  reset(): void {
    this.frameTimes = [];
    this.frameCount = 0;
    this.frameDrops = 0;
  }
}

export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return function(this: any, ...args: Parameters<T>) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  return function(this: any, ...args: Parameters<T>) {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}
