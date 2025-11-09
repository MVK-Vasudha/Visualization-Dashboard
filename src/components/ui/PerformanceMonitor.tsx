import { memo } from 'react';
import { usePerformanceMonitor } from '@/hooks/usePerformanceMonitor';
import { Card } from '@/components/ui/card';

function PerformanceMonitorComponent() {
  const { metrics } = usePerformanceMonitor();
  
  const getFpsColor = (fps: number) => {
    if (fps >= 55) return 'text-green-500';
    if (fps >= 30) return 'text-yellow-500';
    return 'text-red-500';
  };
  
  return (
    <Card className="p-4">
      <h3 className="text-sm font-semibold mb-3 text-foreground">Performance Metrics</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        <div>
          <div className="text-muted-foreground text-xs">FPS</div>
          <div className={`text-2xl font-bold ${getFpsColor(metrics.fps)}`}>
            {metrics.fps.toFixed(1)}
          </div>
        </div>
        <div>
          <div className="text-muted-foreground text-xs">Memory (MB)</div>
          <div className="text-2xl font-bold text-foreground">
            {metrics.memoryUsage.toFixed(1)}
          </div>
        </div>
        <div>
          <div className="text-muted-foreground text-xs">Render (ms)</div>
          <div className="text-2xl font-bold text-foreground">
            {metrics.renderTime.toFixed(2)}
          </div>
        </div>
        <div>
          <div className="text-muted-foreground text-xs">Frame Drops</div>
          <div className="text-2xl font-bold text-foreground">
            {metrics.frameDrops}
          </div>
        </div>
      </div>
    </Card>
  );
}

export const PerformanceMonitor = memo(PerformanceMonitorComponent);
