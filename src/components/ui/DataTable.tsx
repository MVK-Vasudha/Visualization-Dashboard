import { memo } from 'react';
import { DataPoint } from '@/lib/types';
import { useVirtualization } from '@/hooks/useVirtualization';
import { Card } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface DataTableProps {
  data: DataPoint[];
}

function DataTableComponent({ data }: DataTableProps) {
  const { virtualItems, totalHeight, handleScroll } = useVirtualization(data, {
    itemHeight: 40,
    containerHeight: 400,
    overscan: 10,
  });
  
  return (
    <Card className="overflow-hidden">
      <div className="p-4 border-b border-border bg-card">
        <h3 className="text-sm font-semibold text-card-foreground">
          Data Table ({data.length.toLocaleString()} points)
        </h3>
      </div>
      
      <div
        className="overflow-auto bg-background"
        style={{ height: '400px' }}
        onScroll={handleScroll}
      >
        <div style={{ height: `${totalHeight}px`, position: 'relative' }}>
          <div className="sticky top-0 bg-card border-b border-border z-10 flex">
            <div className="w-[100px] px-4 py-3 text-left font-medium text-sm text-muted-foreground">Index</div>
            <div className="flex-1 px-4 py-3 text-left font-medium text-sm text-muted-foreground">Timestamp</div>
            <div className="flex-1 px-4 py-3 text-left font-medium text-sm text-muted-foreground">Value</div>
            <div className="flex-1 px-4 py-3 text-left font-medium text-sm text-muted-foreground">Category</div>
          </div>
          {virtualItems.map(({ item, index, offsetTop }) => (
            <div
              key={index}
              className="absolute w-full flex border-b border-border hover:bg-muted/50 transition-colors"
              style={{
                top: `${offsetTop}px`,
                height: '40px',
              }}
            >
              <div className="w-[100px] px-4 py-2 text-sm font-medium text-foreground flex items-center">{index}</div>
              <div className="flex-1 px-4 py-2 text-sm text-foreground flex items-center">
                {new Date(item.timestamp).toLocaleTimeString()}
              </div>
              <div className="flex-1 px-4 py-2 text-sm text-foreground flex items-center">{item.value.toFixed(2)}</div>
              <div className="flex-1 px-4 py-2 text-sm text-foreground flex items-center">{item.category}</div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

export const DataTable = memo(DataTableComponent);
