/* Typed toast facade over the Base-UI global toast manager.
 *
 * Callable from inside React (via useNotify) and outside it (services,
 * utilities): the manager is created once here and consumed by <AppToaster/>.
 * Kinds: success | info | warning | error. `confirm` adds an action button.
 * Form validation errors stay inline (ErrorBox) — toasts are for transient,
 * global feedback only.
 */

import { Toast } from "@base-ui/react/toast";

import { ApiError } from "@/lib/api";
import { TOAST_LIMIT, TOAST_TIMEOUT_MS } from "@/lib/constants";

export type ToastKind = "success" | "info" | "warning" | "error";

export interface ConfirmAction {
  label: string;
  onClick: () => void;
}

export const toastManager = Toast.createToastManager();

export const TOAST_PROVIDER = {
  limit: TOAST_LIMIT,
  timeout: TOAST_TIMEOUT_MS,
} as const;

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

function push({ title, description, kind = "info", timeout }: NotifyInput): string {
  return toastManager.add({
    title,
    description,
    type: kind,
    timeout: timeout ?? (kind === "error" ? ERROR_TIMEOUT_MS : undefined),
  });
}

export const notify = {
  success: (title: string, description?: string): string => push({ title, description, kind: "success" }),
  info: (title: string, description?: string): string => push({ title, description, kind: "info" }),
  warning: (title: string, description?: string): string => push({ title, description, kind: "warning" }),
  error: (title: string, description?: string): string =>
    push({ title, description, kind: "error", timeout: ERROR_TIMEOUT_MS }),
  confirm: (title: string, description: string, action: ConfirmAction): string => {
    const id = toastManager.add({
      title,
      description,
      type: "info",
      timeout: 0,
      actionProps: {
        children: action.label,
        onClick: () => {
          action.onClick();
          toastManager.close(id);
        },
      },
    });
    return id;
  },
  /** Map any failure to an error toast with the same language as ErrorBox. */
  fromError: (err: unknown): string => {
    const { title, detail } = friendlyError(err);
    return notify.error(title, detail);
  },
  close: (id: string): void => {
    toastManager.close(id);
  },
};
