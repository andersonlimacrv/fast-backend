/* Push-provider wiring (goey-toast) behind the `services/notify` contract
 * (change `notify-standard` S3).
 *
 * Pages, hooks and services import ONLY `services/notify` (the stable
 * contract). Swapping the toast library again means rewriting this file plus
 * the mount visuals in `toaster.tsx` — nothing else.
 *
 * House adaptation (owner 2026-10-13 — site defaults kept unless noted):
 * stack cap via native `maxQueue={3}` (set on the mount, not trimmed here);
 * durations follow the contract policy (5s default, 7s errors) instead of
 * the lib 4s default; kind icons are ours (`lib/icons`, passed as ReactNode);
 * `theme` + `spring` are wired on the mount (`toaster.tsx`).
 */

import { gooeyToast } from "goey-toast";
import type { ReactNode } from "react";

import { CircleCheck, CircleX, Info, TriangleAlert } from "@/lib/icons";
import { TOAST_LIMIT, TOAST_TIMEOUT_MS } from "@/lib/constants";

export const TOAST_PROVIDER = {
  limit: TOAST_LIMIT,
  timeout: TOAST_TIMEOUT_MS,
} as const;

export type ProviderKind = "success" | "info" | "warning" | "error";

const KIND_ICONS: Record<ProviderKind, ReactNode> = {
  success: <CircleCheck className="size-4" aria-hidden="true" />,
  info: <Info className="size-4" aria-hidden="true" />,
  warning: <TriangleAlert className="size-4" aria-hidden="true" />,
  error: <CircleX className="size-4" aria-hidden="true" />,
};

export interface ProviderToastInput {
  title: string;
  description?: string;
  kind: ProviderKind;
  timeout?: number;
}

export interface ProviderPromiseLabels<T = unknown> {
  loading: string;
  success: string | ((data: T) => string);
  error: string | ((err: unknown) => string);
  description?: {
    success?: ReactNode | ((data: T) => ReactNode);
    error?: ReactNode | ((err: unknown) => ReactNode);
  };
}

export function providerPush(input: ProviderToastInput): string {
  const id = gooeyToast[input.kind](input.title, {
    description: input.description,
    duration: input.timeout ?? TOAST_TIMEOUT_MS,
    icon: KIND_ICONS[input.kind],
  });
  return String(id);
}

export function providerPromise<T>(
  task: Promise<T> | (() => Promise<T>),
  labels: ProviderPromiseLabels<T>,
): Promise<T> {
  const pending = typeof task === "function" ? task() : task;
  gooeyToast.promise(pending, {
    loading: labels.loading,
    success: labels.success,
    error: labels.error,
    description: labels.description,
  });
  return pending;
}

export function providerClose(id: string): void {
  gooeyToast.dismiss(id);
}
