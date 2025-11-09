import { createContext, useContext, useState, ReactNode } from 'react';
import { DataPoint, FilterOptions, AggregationPeriod } from '@/lib/types';
import { aggregateDataByPeriod } from '@/lib/dataGenerator';

interface DataContextValue {
  rawData: DataPoint[];
  filteredData: DataPoint[];
  filters: FilterOptions;
  updateFilters: (filters: Partial<FilterOptions>) => void;
  isStreaming: boolean;
  toggleStreaming: () => void;
  dataCount: number;
  setDataCount: (count: number) => void;
}

const DataContext = createContext<DataContextValue | null>(null);

const AGGREGATION_PERIODS: Record<string, AggregationPeriod> = {
  '1min': { value: '1min', label: '1 Minute', milliseconds: 60000 },
  '5min': { value: '5min', label: '5 Minutes', milliseconds: 300000 },
  '1hour': { value: '1hour', label: '1 Hour', milliseconds: 3600000 },
};

export function DataProvider({ 
  children, 
  initialData 
}: { 
  children: ReactNode;
  initialData: DataPoint[];
}) {
  const [rawData] = useState<DataPoint[]>(initialData);
  const [isStreaming, setIsStreaming] = useState(false);
  const [dataCount, setDataCount] = useState(10000);
  const [filters, setFilters] = useState<FilterOptions>({
    categories: ['A', 'B', 'C', 'D', 'E'],
    timeRange: {
      start: Date.now() - 3600000,
      end: Date.now(),
    },
    aggregation: AGGREGATION_PERIODS['1min'],
  });
  
  const filteredData = (() => {
    let data = rawData.filter(
      point =>
        filters.categories.includes(point.category) &&
        point.timestamp >= filters.timeRange.start &&
        point.timestamp <= filters.timeRange.end
    );
    
    if (filters.aggregation.milliseconds > 0) {
      data = aggregateDataByPeriod(data, filters.aggregation.milliseconds);
    }
    
    return data;
  })();
  
  const updateFilters = (newFilters: Partial<FilterOptions>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };
  
  const toggleStreaming = () => {
    setIsStreaming(prev => !prev);
  };
  
  return (
    <DataContext.Provider
      value={{
        rawData,
        filteredData,
        filters,
        updateFilters,
        isStreaming,
        toggleStreaming,
        dataCount,
        setDataCount,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within DataProvider');
  }
  return context;
}
