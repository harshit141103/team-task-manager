import { LucideIcon } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function MetricCard({
  title,
  value,
  detail,
  icon: Icon,
  tone = "primary"
}: {
  title: string;
  value: string | number;
  detail?: string;
  icon: LucideIcon;
  tone?: "primary" | "amber" | "pink" | "green";
}) {
  const tones = {
    primary: "bg-primary/10 text-primary",
    amber: "bg-amber-500/10 text-amber-300",
    pink: "bg-pink-500/10 text-pink-300",
    green: "bg-emerald-500/10 text-emerald-300"
  };
  return (
    <Card>
      <CardContent className="flex items-start justify-between p-5">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="mt-3 text-2xl font-semibold">{value}</p>
          {detail && <p className="mt-1 text-xs text-muted-foreground">{detail}</p>}
        </div>
        <span className={cn("flex h-10 w-10 items-center justify-center rounded-lg", tones[tone])}>
          <Icon className="h-5 w-5" />
        </span>
      </CardContent>
    </Card>
  );
}
