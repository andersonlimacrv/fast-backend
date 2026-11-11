import type { ReactNode } from "react";
import { Link } from "react-router-dom";

import { ROUTES } from "@/lib/constants";
import { Check, ShieldCheck } from "@/lib/icons";

const POINTS = [
  "Rotating sessions with reuse detection.",
  "Single sign-on through your own OIDC provider.",
  "An audit trail for every sensitive action.",
] as const;

/**
 * Shared shell for anonymous auth pages (login, register, social callback).
 * Split layout on lg, single column on mobile. Tokens only: no new colors,
 * one visual protagonist (the form), focus rings and 3:1 borders per
 * docs/DESIGN.md §4.5/§8.
 */
export function AuthShell({
  title,
  description,
  children,
  footer,
}: {
  title: string;
  description: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background text-foreground lg:grid lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
      <aside className="hidden flex-col justify-between border-r border-border bg-card px-10 py-10 lg:flex">
        <Link to={ROUTES.home} className="inline-flex items-center gap-2 text-sm font-bold tracking-tight">
          <ShieldCheck className="size-4 text-chart-3" aria-hidden="true" />
          fast-backend <span className="font-normal text-muted-foreground">console</span>
        </Link>
        <div className="max-w-sm">
          <p className="text-xs font-medium text-muted-foreground">Access control</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight">One identity for every workspace.</h2>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            Sign in with your email or let your organization&apos;s identity provider handle authentication. Sessions stay
            short-lived and every sensitive action is recorded.
          </p>
          <ul className="mt-8 space-y-3 text-sm">
            {POINTS.map((point) => (
              <li key={point} className="flex gap-2.5">
                <Check className="mt-0.5 size-4 shrink-0 text-chart-3" aria-hidden="true" />
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>
        <p className="text-xs text-muted-foreground">No trackers. No third-party requests from this page.</p>
      </aside>
      <main className="flex min-h-screen items-center justify-center px-5 py-10 sm:px-8">
        <div className="w-full max-w-sm">
          <Link
            to={ROUTES.home}
            className="mb-8 inline-flex items-center gap-2 text-sm font-bold tracking-tight lg:hidden"
          >
            <ShieldCheck className="size-4 text-chart-3" aria-hidden="true" />
            fast-backend <span className="font-normal text-muted-foreground">console</span>
          </Link>
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{description}</p>
          <div className="mt-8">{children}</div>
          {footer && <div className="mt-8 border-t border-border pt-5 text-sm text-muted-foreground">{footer}</div>}
        </div>
      </main>
    </div>
  );
}
