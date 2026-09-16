import type * as React from "react";
import { Link } from "react-router-dom";

import { GradientCode, RiHome5Fill } from "@/lib/icons";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/* ErrorOne ported from the 404PageNotFound reference: gradient SVG code
 * (single copy in lib/icons) + pill button + dotted grid backdrop.
 * Reusable for any error route (404, 403, 500) via props.
 * EmptyState below covers the "no data yet" sibling (icon + title + action). */

export interface ErrorOneAction {
  label: string;
  href?: string;
  onClick?: () => void;
  icon?: React.ReactNode;
}

export interface ErrorOneProps {
  code?: string;
  title?: string;
  description?: string;
  action?: ErrorOneAction;
  className?: string;
}

export function defaultErrorOneAction(home: string): ErrorOneAction {
  return { label: "Back home", href: home, icon: <RiHome5Fill aria-hidden="true" /> };
}

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({ icon, title, description, actionLabel, onAction, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center px-4 py-12 text-center",
        className,
      )}
    >
      {icon && (
        <span
          aria-hidden="true"
          className="mb-3 flex size-10 items-center justify-center rounded-md bg-muted text-muted-foreground [&_svg]:size-5"
        >
          {icon}
        </span>
      )}
      <p className="text-sm font-semibold">{title}</p>
      {description && <p className="mt-1 max-w-xs text-sm text-muted-foreground">{description}</p>}
      {actionLabel && (
        <Button variant="outline" size="sm" onClick={onAction} className="mt-4">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

export function ErrorOne({ code = "404", title, description, action, className }: ErrorOneProps) {
  return (
    <main
      className={cn(
        "relative mx-auto flex min-h-[60vh] w-full max-w-lg flex-col items-center justify-center overflow-hidden px-4 py-16 text-center",
        className,
      )}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(var(--color-border)_1px,transparent_1px)] [background-size:22px_22px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]"
      />
      <GradientCode code={code} />
      {title && <h1 className="mt-2 text-xl font-bold tracking-tight">{title}</h1>}
      {description && <p className="mt-2 max-w-xs text-sm leading-relaxed text-muted-foreground">{description}</p>}
      {action && (
        <Button asChild={action.href !== undefined} onClick={action.onClick} className="mt-6 rounded-full">
          {action.href !== undefined ? (
            <Link to={action.href}>
              {action.icon}
              {action.label}
            </Link>
          ) : (
            <>
              {action.icon}
              {action.label}
            </>
          )}
        </Button>
      )}
    </main>
  );
}
