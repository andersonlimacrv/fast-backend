import { Toast } from "@base-ui/react/toast";

import { CircleCheck, CircleX, Info, TriangleAlert, X } from "@/lib/icons";

import { TOAST_PROVIDER, toastManager, type ToastKind } from "@/services/notify";
import { cn } from "@/lib/utils";

const KIND_ICON: Record<ToastKind, typeof Info> = {
  success: CircleCheck,
  info: Info,
  warning: TriangleAlert,
  error: CircleX,
};

function ToastItem({ toast }: { toast: Toast.Root.ToastObject }) {
  const kind = (toast.type as ToastKind | undefined) ?? "info";
  const Icon = KIND_ICON[kind] ?? Info;
  return (
    <Toast.Root
      toast={toast}
      className={cn(
        "pointer-events-auto flex w-96 max-w-[calc(100vw-2rem)] items-start gap-3 rounded-lg border bg-card p-4 text-card-foreground shadow-lg",
        "data-[starting-style]:animate-toast-in data-[ending-style]:animate-toast-out",
        "data-[swipe-direction=right]:animate-toast-out-right data-[swipe-direction=left]:animate-toast-out-left",
        "data-[swipe-direction=up]:animate-toast-out-up data-[swipe-direction=down]:animate-toast-out-down",
        kind === "error" && "border-destructive/50",
        kind === "success" && "border-chart-4/50",
        kind === "warning" && "border-chart-3/50",
      )}
      data-kind={kind}
    >
      <Toast.Content className="flex flex-1 items-start gap-3 data-[behind]:opacity-0">
        <Icon className={cn("mt-0.5 h-5 w-5 shrink-0", kind === "error" ? "text-destructive" : "text-primary")} />
        <div className="grid flex-1 gap-1">
          {toast.title != null && <Toast.Title className="text-sm font-semibold" />}
          {toast.description != null && (
            <Toast.Description className="text-sm break-words text-muted-foreground" />
          )}
        </div>
        {toast.actionProps ? (
          <Toast.Action className="shrink-0 rounded-md border border-input bg-background px-2 py-1 text-xs font-medium hover:bg-accent" />
        ) : null}
        <Toast.Close
          className="shrink-0 rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" />
        </Toast.Close>
      </Toast.Content>
    </Toast.Root>
  );
}

function ToastList() {
  const { toasts } = Toast.useToastManager();
  return (
    <>
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </>
  );
}

/** Single mount point for all toasts — render once at the app root. */
export function AppToaster() {
  return (
    <Toast.Provider toastManager={toastManager} limit={TOAST_PROVIDER.limit} timeout={TOAST_PROVIDER.timeout}>
      <Toast.Portal>
        <Toast.Viewport className="fixed right-4 bottom-4 z-[100] flex w-96 max-w-[calc(100vw-2rem)] flex-col gap-2 outline-none">
          <ToastList />
        </Toast.Viewport>
      </Toast.Portal>
    </Toast.Provider>
  );
}
