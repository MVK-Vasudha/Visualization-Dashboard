import { useState, useEffect, useCallback, useRef } from 'react';
import { DataPoint } from '@/lib/types';
import { generateRealtimeDataPoint } from '@/lib/dataGenerator';

const MAX_DATA_POINTS = 10000; // Sliding window

export function useDataStream(initialData: DataPoint[], isStreaming: boolean) {
  const [data, setData] = useState<DataPoint[]>(initialData);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
  const addDataPoint = useCallback(() => {
    setData(prevData => {
      const lastTimestamp = prevData[prevData.length - 1]?.timestamp || Date.now();
      const newPoint = generateRealtimeDataPoint(lastTimestamp);
      
      // Sliding window - remove oldest if exceeding max
      const newData = [...prevData, newPoint];
      if (newData.length > MAX_DATA_POINTS) {
        return newData.slice(-MAX_DATA_POINTS);
      }
      return newData;
    });
  }, []);
  
  useEffect(() => {
    if (isStreaming) {
      intervalRef.current = setInterval(addDataPoint, 100); // New data every 100ms
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isStreaming, addDataPoint]);
  
  const resetData = useCallback((newData: DataPoint[]) => {
    setData(newData);
  }, []);
  
  return { data, resetData };
}
