import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string;
  description: string;
  icon: LucideIcon;
  trend?: "up" | "down" | "stable";
  trendValue?: string;
  variant?: "default" | "ocean" | "alert" | "success";
}

const variantStyles = {
  default: "bg-card hover:bg-accent/5",
  ocean: "gradient-ocean text-primary-foreground hover:shadow-depth",
  alert: "gradient-alert text-danger-foreground hover:shadow-alert",
  success: "gradient-safe text-success-foreground hover:shadow-depth",
};

export function StatsCard({ 
  title, 
  value, 
  description, 
  icon: Icon, 
  trend, 
  trendValue,
  variant = "default" 
}: StatsCardProps) {
  const isGradient = variant !== "default";

  return (
    <Card className={cn(
      "transition-all duration-300 hover:scale-105",
      variantStyles[variant]
    )}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 py-2 px-4">
        <CardTitle className={cn(
          "text-sm font-medium",
          isGradient ? "text-current" : "text-muted-foreground"
        )}>
          {title}
        </CardTitle>
        <Icon className={cn(
          "h-4 w-4",
          isGradient ? "text-current opacity-80" : "text-muted-foreground"
        )} />
      </CardHeader>
      <CardContent className="pt-0 px-4 pb-3">
        <div className={cn(
          "text-xl font-bold",
          isGradient ? "text-current" : "text-foreground"
        )}>
          {value}
        </div>
        <div className="flex items-center space-x-2">
          <p className={cn(
            "text-xs",
            isGradient ? "text-current opacity-80" : "text-muted-foreground"
          )}>
            {description}
          </p>
          {trend && trendValue && (
            <span className={cn(
              "text-xs font-medium",
              trend === "up" ? "text-success" : 
              trend === "down" ? "text-danger" : "text-muted-foreground",
              isGradient && "opacity-90"
            )}>
              {trend === "up" ? "↗" : trend === "down" ? "↘" : "→"} {trendValue}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
