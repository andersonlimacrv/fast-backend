/* Membership domain: thin, stable signatures over the transport. */

import { addMember, changeMemberRole, listMembers, removeMember } from "@/lib/api";
import type { MembershipRead } from "@/lib/api";

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
