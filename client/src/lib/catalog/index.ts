/* Catalog barrel: single import surface for the Lab / Gallery pages.
 * `CATALOG` is the source of truth for numbering, classification and status;
 * add new reference docs to `entries.ts` (append the next `n`). */

export type {
  CatalogClass,
  CatalogEntry,
  CatalogKind,
  CatalogStatus,
  CatalogUsage,
  RefGroup,
} from "./types";
export { CATALOG } from "./entries";

import { CATALOG } from "./entries";
import type { CatalogClass, CatalogEntry, CatalogStatus } from "./types";

/** Stable display order used by both pages. */
export const CLASS_ORDER: CatalogClass[] = ["component", "block"];

export const CLASS_LABEL: Record<CatalogClass, string> = {
  component: "Components",
  block: "Blocks",
};

/** Entries of one class, in `n` order. */
export function byClass(cls: CatalogClass): CatalogEntry[] {
  return CATALOG.filter((e) => e.class === cls);
}

/** Entries with one status, in `n` order. */
export function byStatus(status: CatalogStatus): CatalogEntry[] {
  return CATALOG.filter((e) => e.status === status);
}

/** Validated entries of one class, in `n` order — what the Gallery shows. */
export function validatedByClass(cls: CatalogClass): CatalogEntry[] {
  return CATALOG.filter((e) => e.class === cls && e.status === "validated");
}

/** Two-digit stable label ("02"). */
export function nn(entry: CatalogEntry): string {
  return String(entry.n).padStart(2, "0");
}
