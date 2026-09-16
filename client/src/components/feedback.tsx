import { cn } from "@/lib/utils";
import { friendlyError } from "@/services/notify";

export { friendlyError };

export function ErrorBox({ error, className }: { error: unknown; className?: string }) {
  if (!error) return null;
  const { title, detail } = friendlyError(error);
  return (
    <div className={cn("rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm", className)}>
      <p className="font-semibold text-destructive">{title}</p>
      <p className="mt-1 break-words text-muted-foreground">{detail}</p>
    </div>
  );
}

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
      <div className="min-w-0">
        <h1 className="text-xl font-bold tracking-tight">{title}</h1>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block font-medium">{label}</span>
      {children}
    </label>
  );
}
