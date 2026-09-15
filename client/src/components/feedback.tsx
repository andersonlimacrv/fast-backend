import { ApiError } from "@/lib/api";
import { cn } from "@/lib/utils";

export function friendlyError(err: unknown): { title: string; detail: string } {
  if (err instanceof ApiError) {
    if (err.status === 0) return { title: "Cannot reach backend", detail: err.message };
    if (err.status === 401) return { title: "Unauthorized (401)", detail: err.message };
    if (err.status === 403)
      return { title: "Forbidden (403)", detail: `${err.message} — check membership, role or entitlement.` };
    if (err.status === 404) return { title: "Not found (404)", detail: err.message };
    if (err.status === 429) return { title: "Rate limited (429)", detail: err.message };
    return { title: `Error (${err.status})`, detail: err.message };
  }
  return { title: "Unexpected error", detail: err instanceof Error ? err.message : String(err) };
}

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

export function PageHeader({ title, description }: { title: string; description?: string }) {
  return (
    <div className="mb-4">
      <h1 className="text-xl font-bold tracking-tight">{title}</h1>
      {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
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
