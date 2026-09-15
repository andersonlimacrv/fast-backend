import { Link } from "react-router-dom";
import { House } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/constants";

/* Catch-all route: restrained 404 (tokens only, single accent element). */

export function NotFoundPage({
  code = "404",
  title = "Page not found",
  description = "The address doesn't match any route in this console.",
}: {
  code?: string;
  title?: string;
  description?: string;
}) {
  return (
    <main className="mx-auto flex min-h-[60vh] w-full max-w-lg flex-col items-center justify-center px-4 py-16 text-center">
      <p className="font-mono text-6xl font-bold tracking-tighter text-muted-foreground/40" aria-hidden="true">
        {code}
      </p>
      <h1 className="mt-4 text-xl font-bold tracking-tight">{title}</h1>
      <p className="mt-2 max-w-xs text-sm leading-relaxed text-muted-foreground">{description}</p>
      <Button asChild className="mt-6">
        <Link to={ROUTES.home}>
          <House aria-hidden="true" /> Back home
        </Link>
      </Button>
    </main>
  );
}
