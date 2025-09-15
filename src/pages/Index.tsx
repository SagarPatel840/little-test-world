import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TestMetrics, TestProgress } from "@/components/TestCard";
import { Play, Pause, RotateCcw, Settings, CheckCircle2, AlertCircle, Clock } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import heroImage from "@/assets/hero-bg.jpg";

const Index = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [testResults, setTestResults] = useState<"idle" | "running" | "success" | "failed">("idle");

  const runTest = async () => {
    setIsRunning(true);
    setTestResults("running");
    
    // Simulate test execution
    setTimeout(() => {
      const success = Math.random() > 0.3; // 70% success rate
      setTestResults(success ? "success" : "failed");
      setIsRunning(false);
      
      toast({
        title: success ? "Tests Passed!" : "Tests Failed",
        description: success 
          ? "All test suites executed successfully." 
          : "Some tests failed. Check the console for details.",
        variant: success ? "default" : "destructive",
      });
    }, 3000);
  };

  const resetTests = () => {
    setTestResults("idle");
    setIsRunning(false);
    toast({
      title: "Tests Reset",
      description: "Test environment has been reset to initial state.",
    });
  };

  const getStatusIcon = () => {
    switch (testResults) {
      case "running":
        return <Clock className="h-5 w-5 text-primary animate-spin" />;
      case "success":
        return <CheckCircle2 className="h-5 w-5 text-accent" />;
      case "failed":
        return <AlertCircle className="h-5 w-5 text-destructive" />;
      default:
        return <Play className="h-5 w-5" />;
    }
  };

  const getStatusBadge = () => {
    switch (testResults) {
      case "running":
        return <Badge className="bg-primary/20 text-primary border-primary/30">Running</Badge>;
      case "success":
        return <Badge className="bg-accent/20 text-accent border-accent/30">Passed</Badge>;
      case "failed":
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="secondary">Ready</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div 
        className="relative h-80 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-background/80" />
        <div className="relative container mx-auto h-full flex items-center justify-center px-4">
          <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Test Interface
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl">
              Advanced testing suite with real-time monitoring and interactive controls
            </p>
            <div className="flex items-center justify-center gap-4 mt-6">
              {getStatusBadge()}
              {getStatusIcon()}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto p-6 space-y-8">
        {/* Control Panel */}
        <Card className="bg-gradient-card shadow-elegant">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-primary" />
              Test Control Panel
            </CardTitle>
            <CardDescription>
              Execute and manage your test suites
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <Button
                onClick={runTest}
                disabled={isRunning}
                variant="hero"
              >
                {isRunning ? (
                  <>
                    <Pause className="mr-2 h-4 w-4" />
                    Running Tests...
                  </>
                ) : (
                  <>
                    <Play className="mr-2 h-4 w-4" />
                    Run All Tests
                  </>
                )}
              </Button>
              
              <Button
                onClick={resetTests}
                variant="accent"
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                Reset
              </Button>
              
              <Button 
                variant="outline"
                className="border-accent/30 hover:bg-accent/10 transition-all duration-300"
              >
                <Settings className="mr-2 h-4 w-4" />
                Configure
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Metrics */}
        <TestMetrics />

        {/* Progress */}
        <TestProgress />

        {/* Test Results */}
        <Card className="bg-gradient-card shadow-elegant">
          <CardHeader>
            <CardTitle>Recent Test Results</CardTitle>
            <CardDescription>
              Latest test execution outcomes and performance metrics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 rounded-lg bg-primary/10 border border-primary/20">
                  <div className="text-2xl font-bold text-primary">1,284</div>
                  <div className="text-sm text-muted-foreground">Total Tests</div>
                </div>
                <div className="text-center p-4 rounded-lg bg-accent/10 border border-accent/20">
                  <div className="text-2xl font-bold text-accent">1,263</div>
                  <div className="text-sm text-muted-foreground">Passed</div>
                </div>
                <div className="text-center p-4 rounded-lg bg-destructive/10 border border-destructive/20">
                  <div className="text-2xl font-bold text-destructive">21</div>
                  <div className="text-sm text-muted-foreground">Failed</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;