import { notify } from "@/services/notify";

/** Structural type of the facade — always in sync, zero maintenance. */
export type NotifyApi = typeof notify;

/**
 * Typed push helpers. No provider or context needed — the provider is wired
 * once in services/notify.provider and consumed by the mounted toaster.
 */
export function useNotify(): NotifyApi {
  return notify;
}
