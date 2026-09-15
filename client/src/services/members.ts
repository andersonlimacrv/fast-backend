/* Membership domain: thin, stable signatures over the transport. */

import { z } from "zod";

import { addMember, changeMemberRole, listMembers, removeMember } from "@/lib/api";
import type { MembershipRead } from "@/lib/api";
import { ROLES } from "@/lib/constants";

export async function fetchMembers(orgId: string): Promise<MembershipRead[]> {
  return listMembers(orgId);
}

export async function inviteMember(orgId: string, userId: string, role: string): Promise<MembershipRead> {
  return addMember(orgId, userId.trim(), role);
}

export async function updateMemberRole(orgId: string, userId: string, role: string): Promise<MembershipRead> {
  return changeMemberRole(orgId, userId, role);
}

export async function kickMember(orgId: string, userId: string): Promise<void> {
  await removeMember(orgId, userId);
}

export const inviteMemberSchema = z.object({
  userId: z.string().trim().min(1, "User id is required."),
  role: z.enum(ROLES),
});

export type InviteMemberInput = z.input<typeof inviteMemberSchema>;
