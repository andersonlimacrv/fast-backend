import { PageHeader } from "@/components/feedback";
import { RequireStaff } from "@/components/require-staff";
import { Card, CardContent } from "@/components/ui/card";

/* Live demos land here as queue items clear (one section per decision). */
export function PlaygroundComponentsPage() {
  return (
    <RequireStaff title="Playground components">
      <PageHeader
        title="Playground components"
        description="Atomic ports, each live-tested before adoption."
      />
      <Card>
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground">
            No cleared items yet — demos appear here as the alphabetical queue advances.
          </p>
        </CardContent>
      </Card>
    </RequireStaff>
  );
}
