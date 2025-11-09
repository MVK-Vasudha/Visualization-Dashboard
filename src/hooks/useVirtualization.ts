import { useState, useEffect, useMemo, useCallback } from 'react';

interface VirtualizationConfig {
  itemHeight: number;
  containerHeight: number;
  overscan?: number;
}

export function useVirtualization<T>(
  items: T[],
  config: VirtualizationConfig
) {
  const [scrollTop, setScrollTop] = useState(0);
  const { itemHeight, containerHeight, overscan = 5 } = config;
  
  const { virtualItems, totalHeight, startIndex, endIndex } = useMemo(() => {
    const visibleCount = Math.ceil(containerHeight / itemHeight);
    const start = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const end = Math.min(items.length, start + visibleCount + overscan * 2);
    
    const virtualItems = items.slice(start, end).map((item, index) => ({
      item,
      index: start + index,
      offsetTop: (start + index) * itemHeight,
    }));
    
    return {
      virtualItems,
      totalHeight: items.length * itemHeight,
      startIndex: start,
      endIndex: end,
    };
  }, [items, scrollTop, itemHeight, containerHeight, overscan]);
  
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);
  
  return {
    virtualItems,
    totalHeight,
    startIndex,
    endIndex,
    handleScroll,
  };
}
