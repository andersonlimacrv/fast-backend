/* Login domain: email normalization mirrors backend `canonical_email`
 * (strip + lowercase) plus a format gate. Pure and unit-tested. */

import { z } from "zod";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Normalized email, or null when it must not advance (never an oracle). */
export function normalizeEmail(raw: string): string | null {
  const cleaned = raw.trim().toLowerCase();
  return EMAIL_RE.test(cleaned) ? cleaned : null;
}

const emailField = z
  .string()
  .trim()
  .min(1, "Email is required.")
  .refine((v) => normalizeEmail(v) !== null, "Enter a valid email address.")
  .transform((v) => v.trim().toLowerCase());

export { emailField };

export const loginEmailSchema = z.object({ email: emailField });

export const loginPasswordSchema = z.object({
  password: z.string().min(1, "Password is required."),
});

export const registerSchema = z.object({
  email: emailField,
  password: z.string().min(8, "Minimum 8 characters.").max(256, "Maximum 256 characters."),
});

export type LoginEmailInput = z.input<typeof loginEmailSchema>;
export type LoginPasswordInput = z.input<typeof loginPasswordSchema>;
export type RegisterInput = z.input<typeof registerSchema>;
