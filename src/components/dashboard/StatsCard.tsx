import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: number;
  description: string;
  icon: LucideIcon;
  variant: "pending" | "paused" | "progress" | "completed";
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export function StatsCard({ 
  title, 
  value, 
  description, 
  icon: Icon, 
  variant,
  trend 
}: StatsCardProps) {
  const badgeVariantMap = {
    pending: "pending",
    paused: "paused", 
    progress: "progress",
    completed: "completed"
  } as const;

  return (
    <Card className="relative overflow-hidden shadow-soft hover:shadow-medium transition-smooth">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className="h-5 w-5 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline justify-between">
          <div className="text-3xl font-bold text-foreground">{value}</div>
          <Badge variant={badgeVariantMap[variant]}>
            {variant === "pending" && "En attente"}
            {variant === "paused" && "En pause"} 
            {variant === "progress" && "En cours"}
            {variant === "completed" && "Terminé"}
          </Badge>
        </div>
        <div className="flex items-center justify-between mt-2">
          <p className="text-xs text-muted-foreground">{description}</p>
          {trend && (
            <span className={`text-xs font-medium ${
              trend.isPositive ? "text-status-completed" : "text-destructive"
            }`}>
              {trend.isPositive ? "+" : ""}{trend.value}%
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}