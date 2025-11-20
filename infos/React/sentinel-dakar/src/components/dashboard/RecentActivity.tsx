import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, User, AlertTriangle } from "lucide-react";

export type ActivityItem = {
  id: string;
  type: "alert" | "report" | "status" | "info";
  title: string;
  user?: string;
  time: string;
};

const typeStyles: Record<ActivityItem["type"], string> = {
  alert: "bg-destructive/10 text-destructive",
  report: "bg-warning/10 text-warning",
  status: "bg-success/10 text-success",
  info: "bg-muted text-muted-foreground",
};

const mockActivities: ActivityItem[] = [
  { id: "1", type: "alert", title: "Alerte critique activée à Guédiawaye", user: "OPS", time: "il y a 5 min" },
  { id: "2", type: "report", title: "Nouveau signalement citoyen (Pikine)", user: "M. Ndiaye", time: "il y a 12 min" },
  { id: "3", type: "status", title: "Niveau d'eau stabilisé à Médina", user: "Système", time: "il y a 30 min" },
  { id: "4", type: "info", title: "Prévisions de pluie mises à jour", user: "ANACIM", time: "il y a 1 h" },
];

export function RecentActivity({ items }: { items?: ActivityItem[] }) {
  const data = Array.isArray(items) && items.length > 0 ? items : mockActivities;
  return (
    <Card>
      <CardHeader className="py-3 px-4">
        <CardTitle>Activité récente</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 p-4 pt-2">
        {data.map((item) => (
          <div key={item.id} className="flex items-start justify-between rounded-lg p-2 hover:bg-muted/50 transition-colors">
            <div className="flex items-start space-x-3">
              <div className={`h-8 w-8 rounded-full flex items-center justify-center ${typeStyles[item.type]}`}>
                {item.type === "alert" ? (
                  <AlertTriangle className="h-4 w-4" />
                ) : (
                  <Clock className="h-4 w-4" />
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{item.title}</p>
                <div className="mt-1 flex items-center space-x-2 text-xs text-muted-foreground">
                  {item.user && (
                    <span className="inline-flex items-center">
                      <User className="h-3 w-3 mr-1" /> {item.user}
                    </span>
                  )}
                  <span className="inline-flex items-center">
                    <Clock className="h-3 w-3 mr-1" /> {item.time}
                  </span>
                </div>
              </div>
            </div>
            <Badge variant="outline" className={typeStyles[item.type]}>
              {item.type.toUpperCase()}
            </Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export default RecentActivity;


