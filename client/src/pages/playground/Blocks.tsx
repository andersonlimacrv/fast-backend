import { PageHeader } from "@/components/feedback";
import { RequireStaff } from "@/components/require-staff";
import { Card, CardContent } from "@/components/ui/card";

/* Composed blocks land here once ExempleLayours items clear the queue. */
export function PlaygroundBlocksPage() {
  return (
    <RequireStaff title="Playground blocks">
      <PageHeader
        title="Playground blocks"
        description="Composed sections from ExempleLayours."
      />
      <Card>
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground">
            No cleared blocks yet — heroes, cards and calendars appear here as the queue advances.
          </p>
        </CardContent>
      </Card>
    </RequireStaff>
  );
}
