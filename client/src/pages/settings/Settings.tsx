import { PageHeader } from "@/components/feedback";

/* Settings placeholder (future page): the footer avatar menu already covers
 * Account; the gear nav entry reserves this route until real settings land. */
export function SettingsPage() {
  return (
    <div>
      <PageHeader title="Settings" description="Workspace settings will live here." />
      <p className="text-sm text-muted-foreground">Nothing to configure yet — check back soon.</p>
    </div>
  );
}
