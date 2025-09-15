import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Activity, TrendingUp, Users, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface TestCardProps {
  title: string;
  description: string;
  value: string;
  icon: React.ReactNode;
  trend?: number;
  className?: string;
  variant?: "primary" | "accent" | "default";
}

export const TestCard = ({ 
  title, 
  description, 
  value, 
  icon, 
  trend, 
  className,
  variant = "default" 
}: TestCardProps) => {
  return (
    <Card className={cn(
      "relative overflow-hidden transition-all duration-300 hover:scale-105",
      variant === "primary" && "bg-gradient-card border-primary/20 shadow-primary",
      variant === "accent" && "bg-gradient-card border-accent/20 shadow-accent",
      variant === "default" && "bg-gradient-card shadow-elegant",
      className
    )}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className={cn(
          "h-4 w-4",
          variant === "primary" && "text-primary",
          variant === "accent" && "text-accent",
          variant === "default" && "text-muted-foreground"
        )}>
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <CardDescription className="text-xs text-muted-foreground">
          {description}
        </CardDescription>
        {trend && (
          <div className="mt-2 flex items-center space-x-2">
            <TrendingUp className="h-3 w-3 text-accent" />
            <Badge variant="secondary" className="text-xs">
              +{trend}%
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export const TestMetrics = () => {
  const metrics = [
    {
      title: "Total Tests",
      description: "Running test suites",
      value: "1,284",
      icon: <Activity className="h-4 w-4" />,
      trend: 12,
      variant: "primary" as const
    },
    {
      title: "Success Rate",
      description: "All tests passing",
      value: "98.4%",
      icon: <Zap className="h-4 w-4" />,
      trend: 5,
      variant: "accent" as const
    },
    {
      title: "Active Users",
      description: "Currently testing",
      value: "47",
      icon: <Users className="h-4 w-4" />,
      trend: 23,
      variant: "default" as const
    }
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {metrics.map((metric, index) => (
        <TestCard key={index} {...metric} />
      ))}
    </div>
  );
};

export const TestProgress = () => {
  return (
    <Card className="bg-gradient-card shadow-elegant">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" />
          Test Execution Progress
        </CardTitle>
        <CardDescription>
          Current test suite execution status
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Integration Tests</span>
            <span className="text-primary">85%</span>
          </div>
          <Progress value={85} className="h-2" />
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Unit Tests</span>
            <span className="text-accent">92%</span>
          </div>
          <Progress value={92} className="h-2" />
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>End-to-End Tests</span>
            <span className="text-muted-foreground">67%</span>
          </div>
          <Progress value={67} className="h-2" />
        </div>
      </CardContent>
    </Card>
  );
};