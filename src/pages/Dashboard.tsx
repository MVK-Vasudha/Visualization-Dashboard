import { useState, useMemo } from 'react';
import { generateInitialDataset } from '@/lib/dataGenerator';
import { DataProvider, useData } from '@/components/providers/DataProvider';
import { useDataStream } from '@/hooks/useDataStream';
import { PerformanceMonitor } from '@/components/ui/PerformanceMonitor';
import { FilterPanel } from '@/components/controls/FilterPanel';
import { TimeRangeSelector } from '@/components/controls/TimeRangeSelector';
import { DataTable } from '@/components/ui/DataTable';
import { LineChart } from '@/components/charts/LineChart';
import { BarChart } from '@/components/charts/BarChart';
import { ScatterPlot } from '@/components/charts/ScatterPlot';
import { Heatmap } from '@/components/charts/Heatmap';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

function DashboardContent() {
  const { filteredData, isStreaming, dataCount, setDataCount } = useData();
  const { data: streamingData } = useDataStream(filteredData, isStreaming);
  
  const displayData = isStreaming ? streamingData : filteredData;
  
  const [inputCount, setInputCount] = useState(dataCount.toString());
  
  const handleDataCountChange = () => {
    const count = parseInt(inputCount);
    if (!isNaN(count) && count > 0 && count <= 100000) {
      setDataCount(count);
      window.location.reload(); // Simple reload to regenerate data
    }
  };
  
  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-[1800px] mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Performance Dashboard
            </h1>
            <p className="text-muted-foreground mt-1">
              Real-time visualization of {displayData.length.toLocaleString()} data points
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Input
              type="number"
              value={inputCount}
              onChange={(e) => setInputCount(e.target.value)}
              placeholder="Data points"
              className="w-32"
              min="100"
              max="100000"
            />
            <Button onClick={handleDataCountChange} variant="outline">
              Regenerate
            </Button>
          </div>
        </div>
        
        {/* Performance Monitor */}
        <PerformanceMonitor />
        
        {/* Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FilterPanel />
          <TimeRangeSelector />
        </div>
        
        {/* Charts */}
        <Card className="p-6">
          <Tabs defaultValue="line" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="line">Line Chart</TabsTrigger>
              <TabsTrigger value="bar">Bar Chart</TabsTrigger>
              <TabsTrigger value="scatter">Scatter Plot</TabsTrigger>
              <TabsTrigger value="heatmap">Heatmap</TabsTrigger>
            </TabsList>
            
            <TabsContent value="line" className="mt-6">
              <div className="h-[500px] w-full">
                <LineChart data={displayData} />
              </div>
            </TabsContent>
            
            <TabsContent value="bar" className="mt-6">
              <div className="h-[500px] w-full">
                <BarChart data={displayData} />
              </div>
            </TabsContent>
            
            <TabsContent value="scatter" className="mt-6">
              <div className="h-[500px] w-full">
                <ScatterPlot data={displayData} />
              </div>
            </TabsContent>
            
            <TabsContent value="heatmap" className="mt-6">
              <div className="h-[500px] w-full">
                <Heatmap data={displayData} />
              </div>
            </TabsContent>
          </Tabs>
        </Card>
        
        {/* Data Table */}
        <DataTable data={displayData} />
      </div>
    </div>
  );
}

export default function Dashboard() {
  const initialData = useMemo(() => generateInitialDataset(10000), []);
  
  return (
    <DataProvider initialData={initialData}>
      <DashboardContent />
    </DataProvider>
  );
}
