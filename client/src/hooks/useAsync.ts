import { useCallback, useEffect, useRef, useState } from "react";

export interface AsyncState<T> {
  data: T | null;
  error: unknown;
  loading: boolean;
  execute: () => Promise<T | null>;
  reload: () => Promise<T | null>;
}

/**
 * Run an async fetcher with loading/error state. Ignores late responses after
 * unmount or superseded reloads (StrictMode-safe).
 */
export function useAsync<T>(fetcher: () => Promise<T>, deps: unknown[] = []): AsyncState<T> {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<unknown>(null);
  const [loading, setLoading] = useState(true);
  const runId = useRef(0);
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const execute = useCallback(async (): Promise<T | null> => {
    const id = ++runId.current;
    setLoading(true);
    setError(null);
    try {
      const result = await fetcherRef.current();
      if (runId.current === id) setData(result);
      return result;
    } catch (err) {
      if (runId.current === id) setError(err);
      return null;
    } finally {
      if (runId.current === id) setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    void execute();
    return () => {
      runId.current += 1;
    };
  }, [execute]);

  return { data, error, loading, execute, reload: execute };
}
