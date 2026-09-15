import { useAsync } from "@/hooks/useAsync";
import { fetchReleaseInfo, type ReleaseInfo } from "@/services/meta";

export function useReleaseInfo() {
  return useAsync<ReleaseInfo>(() => fetchReleaseInfo(), []);
}
