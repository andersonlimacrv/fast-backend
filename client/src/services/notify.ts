/* Typed push-notification facade. Contract only — the push provider lives
 * behind `services/notify.provider` (change `notify-standard` S2), so
 * swapping the toast library touches the provider, never the pages.
 *
 * Callable from inside React (via useNotify) and outside it (services,
 * utilities). Kinds: success | info | warning | error.
 * `notify.error`/`fromError` share `friendlyError` with ErrorBox (single
 * language). Blocking choices use AlertDialog, never toasts. Form validation
 * errors stay inline (ErrorBox) — toasts are for transient, global feedback
 * only.
 */

import { ApiError } from "@/lib/api";
import { providerClose, providerPromise, providerPush, type ProviderPromiseLabels } from "@/services/notify.provider";

export type ToastKind = "success" | "info" | "warning" | "error";

const ERROR_TIMEOUT_MS = 7000;

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

export interface NotifyInput {
  title: string;
  description?: string;
  kind?: ToastKind;
  timeout?: number;
}

export type { ProviderPromiseLabels as NotifyPromiseLabels };

function push({ title, description, kind = "info", timeout }: NotifyInput): string {
  return providerPush({
    title,
    description,
    kind,
    timeout: timeout ?? (kind === "error" ? ERROR_TIMEOUT_MS : undefined),
  });
}

export const notify = {
  success: (title: string, description?: string): string => push({ title, description, kind: "success" }),
  info: (title: string, description?: string): string => push({ title, description, kind: "info" }),
  warning: (title: string, description?: string): string => push({ title, description, kind: "warning" }),
  error: (title: string, description?: string): string =>
    push({ title, description, kind: "error", timeout: ERROR_TIMEOUT_MS }),
  /** Map any failure to an error toast with the same language as ErrorBox. */
  fromError: (err: unknown): string => {
    const { title, detail } = friendlyError(err);
    return notify.error(title, detail);
  },
  /** Lifecycle toast for an async task (loading → success/error). A string
   * `error` title keeps the rejection detail mapped through `friendlyError`
   * as the body (single language with ErrorBox). */
  promise: <T,>(task: Promise<T> | (() => Promise<T>), labels: ProviderPromiseLabels<T>): Promise<T> =>
    providerPromise(task, {
      loading: labels.loading,
      success: labels.success,
      error: labels.error,
      description: {
        success: labels.description?.success,
        error: (err: unknown) => {
          const custom = labels.description?.error;
          if (typeof custom === "function") return custom(err);
          return custom ?? friendlyError(err).detail;
        },
      },
    }),
  close: (id: string): void => {
    providerClose(id);
  },
};
