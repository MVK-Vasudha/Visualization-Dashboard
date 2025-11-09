import { DataPoint } from './types';

const CATEGORIES = ['A', 'B', 'C', 'D', 'E'];

export function generateInitialDataset(count: number = 10000): DataPoint[] {
  const now = Date.now();
  const data: DataPoint[] = [];
  
  for (let i = 0; i < count; i++) {
    const timestamp = now - (count - i) * 1000; // 1 data point per second
    data.push({
      timestamp,
      value: Math.sin(i / 100) * 50 + Math.random() * 20 + 100,
      category: CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)],
      metadata: {
        index: i,
        volatility: Math.random(),
      },
    });
  }
  
  return data;
}

export function generateRealtimeDataPoint(lastTimestamp: number): DataPoint {
  return {
    timestamp: lastTimestamp + 100, // New point every 100ms
    value: Math.sin(lastTimestamp / 10000) * 50 + Math.random() * 20 + 100,
    category: CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)],
    metadata: {
      realtime: true,
      volatility: Math.random(),
    },
  };
}

export function aggregateDataByPeriod(
  data: DataPoint[],
  periodMs: number
): DataPoint[] {
  if (data.length === 0) return [];
  
  const aggregated: Map<number, DataPoint[]> = new Map();
  
  data.forEach(point => {
    const bucket = Math.floor(point.timestamp / periodMs) * periodMs;
    if (!aggregated.has(bucket)) {
      aggregated.set(bucket, []);
    }
    aggregated.get(bucket)!.push(point);
  });
  
  return Array.from(aggregated.entries()).map(([timestamp, points]) => ({
    timestamp,
    value: points.reduce((sum, p) => sum + p.value, 0) / points.length,
    category: points[0].category,
    metadata: {
      count: points.length,
      aggregated: true,
    },
  }));
}
