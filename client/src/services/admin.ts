/* Admin domain: thin, stable signatures over the transport + pure reason helper.
 *
 * Every privileged mutation requires an auditable `reason` (backend enforces
 * min 8 chars with 422; this helper keeps invalid input from ever leaving
 * the page so the failure shows inline instead of as a toast).
 */

import {
  createAdminUser,
  disableAdminUser,
  enableAdminUser,
  forceAdminPasswordReset,
  getAdminOverview,
  grantStaff,
  listAdminAudit,
  listAdminOrgs,
  listAdminUsers,
  removeAdminMembership,
  revokeAdminSessions,
  revokeStaff,
  setAdminMembership,
} from "@/lib/api";
import type { AdminAuditRead, AdminOrgRead, AdminOverview, AdminUserRead, AuditRead } from "@/lib/api";
import { ROLES } from "@/lib/constants";
import { normalizeAuditRow, type AuditRow } from "@/services/audit";
import { emailField } from "@/services/login";
import { z } from "zod";

export const REASON_MIN_LENGTH = 8;
const REASON_MAX_LENGTH = 500;

/** Trimmed reason, or null when it must not leave the page (mirrors backend 422). */
export function normalizeReason(raw: string): string | null {
  const trimmed = raw.trim();
  return trimmed.length >= REASON_MIN_LENGTH ? trimmed : null;
}

export const reasonField = z
  .string()
  .trim()
  .min(REASON_MIN_LENGTH, `Reason is required (min ${REASON_MIN_LENGTH} chars, audited).`)
  .max(REASON_MAX_LENGTH, `Maximum ${REASON_MAX_LENGTH} characters.`);

export const createUserSchema = z.object({
  email: emailField,
  password: z.string().min(8, "Minimum 8 characters.").max(256, "Maximum 256 characters."),
  reason: reasonField,
});

export const adminMembershipSchema = z.object({
  orgId: z.string().min(1, "Pick an organization."),
  userId: z.string().trim().min(1, "User id is required."),
  role: z.enum(ROLES),
  reason: reasonField,
});

export type CreateUserInput = z.input<typeof createUserSchema>;
export type AdminMembershipInput = z.input<typeof adminMembershipSchema>;

export function isRoot(user: { is_superuser: boolean } | null | undefined): boolean {
  return user?.is_superuser === true;
}

export function isStaff(user: { is_staff?: boolean; is_superuser: boolean } | null | undefined): boolean {
  return user?.is_staff === true || isRoot(user);
}

export async function fetchAdminOverview(): Promise<AdminOverview> {
  return getAdminOverview();
}

export async function fetchAdminUsers(): Promise<AdminUserRead[]> {
  return listAdminUsers();
}

export async function createUser(email: string, password: string, reason: string): Promise<AdminUserRead> {
  return createAdminUser(email.trim(), password, reason);
}

export async function disableUser(userId: string, reason: string): Promise<AdminUserRead> {
  return disableAdminUser(userId, reason);
}

export async function enableUser(userId: string, reason: string): Promise<AdminUserRead> {
  return enableAdminUser(userId, reason);
}

export async function revokeUserSessions(userId: string, reason: string): Promise<void> {
  await revokeAdminSessions(userId, reason);
}

export async function forceUserPasswordReset(userId: string, reason: string): Promise<void> {
  await forceAdminPasswordReset(userId, reason);
}

export async function grantUserStaff(userId: string, reason: string): Promise<AdminUserRead> {
  return grantStaff(userId, reason);
}

export async function revokeUserStaff(userId: string, reason: string): Promise<AdminUserRead> {
  return revokeStaff(userId, reason);
}

export async function fetchAdminOrgs(): Promise<AdminOrgRead[]> {
  return listAdminOrgs();
}

export async function setMembership(orgId: string, userId: string, role: string, reason: string): Promise<void> {
  await setAdminMembership(orgId, userId.trim(), role, reason);
}

export async function removeMembership(orgId: string, userId: string, reason: string): Promise<void> {
  await removeAdminMembership(orgId, userId, reason);
}

export async function fetchAdminAudit(): Promise<AuditRow[]> {
  const rows: AdminAuditRead[] = await listAdminAudit();
  return rows.map((row) => normalizeAuditRow(row as AuditRead));
}
