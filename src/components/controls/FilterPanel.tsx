import { memo } from 'react';
import { useData } from '@/components/providers/DataProvider';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

const CATEGORIES = ['A', 'B', 'C', 'D', 'E'];

function FilterPanelComponent() {
  const { filters, updateFilters, isStreaming, toggleStreaming } = useData();
  
  const toggleCategory = (category: string) => {
    const newCategories = filters.categories.includes(category)
      ? filters.categories.filter(c => c !== category)
      : [...filters.categories, category];
    
    updateFilters({ categories: newCategories });
  };
  
  return (
    <Card className="p-4">
      <h3 className="text-sm font-semibold mb-3 text-foreground">Filters</h3>
      
      <div className="space-y-4">
        <div>
          <Label className="text-xs text-muted-foreground mb-2 block">Categories</Label>
          <div className="space-y-2">
            {CATEGORIES.map(category => (
              <div key={category} className="flex items-center space-x-2">
                <Checkbox
                  id={`category-${category}`}
                  checked={filters.categories.includes(category)}
                  onCheckedChange={() => toggleCategory(category)}
                />
                <Label
                  htmlFor={`category-${category}`}
                  className="text-sm cursor-pointer"
                >
                  Category {category}
                </Label>
              </div>
            ))}
          </div>
        </div>
        
        <div className="pt-2 border-t border-border">
          <Button
            onClick={toggleStreaming}
            variant={isStreaming ? 'destructive' : 'default'}
            className="w-full"
          >
            {isStreaming ? 'Stop Streaming' : 'Start Streaming'}
          </Button>
        </div>
      </div>
    </Card>
  );
}

export const FilterPanel = memo(FilterPanelComponent);
