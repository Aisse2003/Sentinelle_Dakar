import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Clock, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

interface AlertCardProps {
  level: "low" | "medium" | "high" | "critical";
  title: string;
  message: string;
  location: string;
  time: string;
  isActive?: boolean;
}

const alertConfig = {
  low: {
    color: "bg-success",
    textColor: "text-success-foreground",
    borderColor: "border-success",
    bgColor: "bg-success/10",
  },
  medium: {
    color: "bg-warning",
    textColor: "text-warning-foreground", 
    borderColor: "border-warning",
    bgColor: "bg-warning/10",
  },
  high: {
    color: "bg-danger",
    textColor: "text-danger-foreground",
    borderColor: "border-danger", 
    bgColor: "bg-danger/10",
  },
  critical: {
    color: "bg-destructive",
    textColor: "text-destructive-foreground",
    borderColor: "border-destructive",
    bgColor: "bg-destructive/10",
  },
};

export function AlertCard({ level, title, message, location, time, isActive }: AlertCardProps) {
  const config = alertConfig[level];

  return (
    <Card className={cn(
      "transition-all duration-300 hover:shadow-lg",
      isActive && "shadow-alert animate-pulse-glow",
      config.bgColor,
      config.borderColor
    )}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-2">
            <AlertTriangle className={cn("h-5 w-5", config.textColor)} />
            <Badge className={cn(config.color, config.textColor)}>
              {level.toUpperCase()}
            </Badge>
          </div>
          {isActive && (
            <div className="h-2 w-2 rounded-full bg-danger animate-pulse" />
          )}
        </div>

        <h3 className="font-semibold text-foreground mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground mb-3">{message}</p>

        <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
          <div className="flex items-center space-x-1">
            <MapPin className="h-3 w-3" />
            <span>{location}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Clock className="h-3 w-3" />
            <span>{time}</span>
          </div>
        </div>

        <div className="flex space-x-2">
          <Button size="sm" variant="outline" className="flex-1">
            Détails
          </Button>
          <Button size="sm" variant="default" className="flex-1">
            Localiser
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}