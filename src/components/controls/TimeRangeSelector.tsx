import { memo } from 'react';
import { useData } from '@/components/providers/DataProvider';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const AGGREGATION_OPTIONS = [
  { value: '1min', label: '1 Minute', ms: 60000 },
  { value: '5min', label: '5 Minutes', ms: 300000 },
  { value: '1hour', label: '1 Hour', ms: 3600000 },
];

const TIME_RANGES = [
  { label: 'Last Hour', ms: 3600000 },
  { label: 'Last 6 Hours', ms: 6 * 3600000 },
  { label: 'Last 24 Hours', ms: 24 * 3600000 },
];

function TimeRangeSelectorComponent() {
  const { filters, updateFilters } = useData();
  
  const handleAggregationChange = (value: string) => {
    const option = AGGREGATION_OPTIONS.find(opt => opt.value === value);
    if (option) {
      updateFilters({
        aggregation: {
          value: option.value as any,
          label: option.label,
          milliseconds: option.ms,
        },
      });
    }
  };
  
  const handleTimeRangeChange = (ms: number) => {
    const now = Date.now();
    updateFilters({
      timeRange: {
        start: now - ms,
        end: now,
      },
    });
  };
  
  return (
    <Card className="p-4">
      <h3 className="text-sm font-semibold mb-3 text-foreground">Time Range & Aggregation</h3>
      
      <div className="space-y-4">
        <div>
          <label className="text-xs text-muted-foreground mb-2 block">
            Aggregation Period
          </label>
          <Select
            value={filters.aggregation.value}
            onValueChange={handleAggregationChange}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {AGGREGATION_OPTIONS.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <label className="text-xs text-muted-foreground mb-2 block">
            Quick Time Ranges
          </label>
          <div className="grid grid-cols-3 gap-2">
            {TIME_RANGES.map(range => (
              <Button
                key={range.label}
                variant="outline"
                size="sm"
                onClick={() => handleTimeRangeChange(range.ms)}
                className="text-xs"
              >
                {range.label}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}

export const TimeRangeSelector = memo(TimeRangeSelectorComponent);
