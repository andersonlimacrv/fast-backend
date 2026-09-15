import { Toast } from "@base-ui/react/toast";

import { notify, type ConfirmAction, type ToastKind } from "@/services/notify";

export type { ConfirmAction, ToastKind };

export interface NotifyApi {
  success: (title: string, description?: string) => string;
  info: (title: string, description?: string) => string;
  warning: (title: string, description?: string) => string;
  error: (title: string, description?: string) => string;
  confirm: (title: string, description: string, action: ConfirmAction) => string;
  fromError: (err: unknown) => string;
  close: (id: string) => void;
}

/**
 * Typed toast helpers bound to the ambient Base-UI manager. No provider or
 * context needed — the manager is created once in services/notify and
 * consumed by <AppToaster/>.
 */
export function useNotify(): NotifyApi {
  // Subscribes to the manager so the component re-renders with it; the
  // returned helpers are the stable global facade.
  Toast.useToastManager();
  return notify;
}
