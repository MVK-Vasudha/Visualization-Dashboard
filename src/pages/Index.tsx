import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background">
      <Card className="max-w-2xl w-full p-8 space-y-6">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-foreground">
            Performance Dashboard
          </h1>
          <p className="text-lg text-muted-foreground">
            High-performance real-time data visualization built with React + Canvas
          </p>
        </div>
        
        <div className="space-y-3">
          <h2 className="text-xl font-semibold text-foreground">Features</h2>
          <ul className="space-y-2 text-muted-foreground">
            <li>✓ Renders 10,000+ data points at 60 FPS</li>
            <li>✓ Real-time updates every 100ms</li>
            <li>✓ Multiple chart types (Line, Bar, Scatter, Heatmap)</li>
            <li>✓ Interactive controls with filtering and aggregation</li>
            <li>✓ Virtual scrolling for large datasets</li>
            <li>✓ Performance monitoring built-in</li>
          </ul>
        </div>
        
        <div className="pt-4">
          <Button 
            onClick={() => navigate('/dashboard')} 
            size="lg" 
            className="w-full"
          >
            Launch Dashboard
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default Index;
