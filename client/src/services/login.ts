/* Login domain: email normalization mirrors backend `canonical_email`
 * (strip + lowercase) plus a format gate. Pure and unit-tested. */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Normalized email, or null when it must not advance (never an oracle). */
export function normalizeEmail(raw: string): string | null {
  const cleaned = raw.trim().toLowerCase();
  return EMAIL_RE.test(cleaned) ? cleaned : null;
}
