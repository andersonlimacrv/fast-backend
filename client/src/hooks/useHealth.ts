import { useAsync, type AsyncState } from "@/hooks/useAsync";
import { fetchHealth, type HealthSnapshot } from "@/services/health";

export function useHealth(): AsyncState<HealthSnapshot> & { refresh: () => Promise<HealthSnapshot | null> } {
  const state = useAsync(fetchHealth);
  return { ...state, refresh: state.reload };
}
