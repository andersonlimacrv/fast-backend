/* Health domain: dependency-free probes (no auth required). */

import { getHealthz, getReadyz } from "@/lib/api";
import type { ReadyzRead } from "@/lib/api";

export interface HealthSnapshot {
  health: { status: string };
  ready: ReadyzRead;
}

export async function fetchHealth(): Promise<HealthSnapshot> {
  const [health, ready] = await Promise.all([getHealthz(), getReadyz()]);
  return { health, ready };
}
