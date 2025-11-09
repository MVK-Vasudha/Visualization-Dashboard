export interface DataPoint {
  timestamp: number;
  value: number;
  category: string;
  metadata?: Record<string, any>;
}

export interface ChartConfig {
  type: 'line' | 'bar' | 'scatter' | 'heatmap';
  dataKey: string;
  color: string;
  visible: boolean;
}

export interface PerformanceMetrics {
  fps: number;
  memoryUsage: number;
  renderTime: number;
  dataProcessingTime: number;
  frameDrops: number;
}

export interface TimeRange {
  start: number;
  end: number;
}

export interface AggregationPeriod {
  value: '1min' | '5min' | '1hour';
  label: string;
  milliseconds: number;
}

export interface FilterOptions {
  categories: string[];
  timeRange: TimeRange;
  aggregation: AggregationPeriod;
}

export interface ChartBounds {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  width: number;
  height: number;
  paddingLeft: number;
  paddingRight: number;
  paddingTop: number;
  paddingBottom: number;
}

export interface ZoomState {
  scale: number;
  offsetX: number;
  offsetY: number;
}
