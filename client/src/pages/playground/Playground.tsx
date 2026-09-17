import { Link } from "react-router-dom";

import { PageHeader } from "@/components/feedback";
import { RequireStaff } from "@/components/require-staff";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ROUTES } from "@/lib/constants";

/* Playground index: the 1-by-1 incorporation queue (references/ →
 * decision → port). Demos land in Components/Blocks as items clear. */

export const PLAYGROUND_QUEUE: { doc: string; status: "stamped" | "pending" }[] = [
  { doc: "404PageNotFound", status: "pending" },
  { doc: "Accordion", status: "pending" },
  { doc: "AlertDialog", status: "pending" },
  { doc: "AnimatedCircularProgressBar", status: "pending" },
  { doc: "Checkbox", status: "pending" },
  { doc: "CopyButton", status: "stamped" },
  { doc: "CreditUsageCard", status: "pending" },
  { doc: "DeplymentCard", status: "pending" },
  { doc: "Dialog", status: "pending" },
  { doc: "DropdownMenu", status: "stamped" },
  { doc: "ExpandDetails", status: "pending" },
  { doc: "FileTree", status: "pending" },
  { doc: "FileUpload", status: "pending" },
  { doc: "Inputs", status: "pending" },
  { doc: "Radio", status: "pending" },
  { doc: "RunActionButton", status: "pending" },
  { doc: "Sidebar", status: "stamped" },
  { doc: "SubsriptionCalendar", status: "pending" },
  { doc: "SwitchModeToggle", status: "pending" },
  { doc: "Tabs", status: "pending" },
  { doc: "ToggleGroup", status: "pending" },
  { doc: "Tooltip", status: "stamped" },
  { doc: "UserAvatar", status: "pending" },
];

export function PlaygroundPage() {
  return (
    <RequireStaff title="Playground">
      <PageHeader
        title="Playground"
        description="1-by-1 proving ground for references/components_to_use."
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Components</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-3 text-sm text-muted-foreground">
              Atomic ports, each live-tested before adoption.
            </p>
            <Link to={ROUTES.playgroundComponents} className="text-foreground underline decoration-primary/70 underline-offset-4">
              Open components
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Blocks</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-3 text-sm text-muted-foreground">
              Composed sections (heroes, cards, calendars) from ExempleLayours.
            </p>
            <Link to={ROUTES.playgroundBlocks} className="text-foreground underline decoration-primary/70 underline-offset-4">
              Open blocks
            </Link>
          </CardContent>
        </Card>
      </div>
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Queue</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="grid gap-1 text-sm sm:grid-cols-2">
            {PLAYGROUND_QUEUE.map((q) => (
              <li key={q.doc} className="flex items-center gap-2">
                <Badge variant={q.status === "stamped" ? "default" : "secondary"}>{q.status}</Badge>
                <span className="font-mono text-xs">{q.doc}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </RequireStaff>
  );
}
