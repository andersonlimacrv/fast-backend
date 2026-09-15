/* Account domain: password change over the transport. */

import { changePassword } from "@/lib/api";

export async function updatePassword(currentPassword: string, newPassword: string): Promise<void> {
  await changePassword(currentPassword, newPassword);
}
