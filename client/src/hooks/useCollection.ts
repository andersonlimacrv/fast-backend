import { useState } from "react";

import { useAsync } from "@/hooks/useAsync";

export interface CollectionState<T> {
  items: T[];
  error: unknown;
  loading: boolean;
  busy: boolean;
  reload: () => Promise<unknown>;
  mutate: (fn: () => Promise<unknown>) => Promise<void>;
  setError: (err: unknown) => void;
  setBusy: (busy: boolean) => void;
}

/**
 * List + mutate-then-reload pattern shared by the table pages. `fetchList`
 * must tolerate a missing scope (e.g. no active org) by returning [].
 */
export function useCollection<T>(fetchList: () => Promise<T[]>, deps: unknown[] = []): CollectionState<T> {
  const [busy, setBusy] = useState(false);
  const [manualError, setManualError] = useState<unknown>(null);
  const state = useAsync<T[]>(fetchList, deps);

  const mutate = async (fn: () => Promise<unknown>): Promise<void> => {
    setBusy(true);
    setManualError(null);
    try {
      await fn();
      await state.reload();
    } catch (err) {
      setManualError(err);
    } finally {
      setBusy(false);
    }
  };

  return {
    items: state.data ?? [],
    error: manualError ?? state.error,
    loading: state.loading,
    busy,
    reload: () => state.reload(),
    mutate,
    setError: setManualError,
    setBusy,
  };
}
