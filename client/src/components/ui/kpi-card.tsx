import { ArrowDownRight, ArrowUpRight } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

/* KPI card (DESIGN.md §5.1): number first, delta with icon AND color
 * (never color alone — §8), tabular numerals for digit alignment. */

export interface KpiCardProps {
  label: string;
  value: string;
  delta?: number;
  footer?: React.ReactNode;
  className?: string;
}

export function KpiCard({ label, value, delta, footer, className }: KpiCardProps) {
  const positive = (delta ?? 0) >= 0;
  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline gap-2">
          <span className="font-mono text-3xl font-semibold tabular-nums">{value}</span>
            {delta !== undefined && (
              <span
                className={cn(
                  "flex items-center text-sm font-medium",
                  positive ? "text-emerald-600 dark:text-emerald-400" : "text-destructive",
                )}
                aria-label={`${positive ? "up" : "down"} ${Math.abs(delta)} percent`}
              >
                {positive ? <ArrowUpRight className="size-4" aria-hidden="true" /> : <ArrowDownRight className="size-4" aria-hidden="true" />}
                {Math.abs(delta)}%
              </span>
            )}
          </div>
          {footer && <div className="mt-2 text-sm">{footer}</div>}
      </CardContent>
    </Card>
  );
}
