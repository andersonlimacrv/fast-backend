/* Social login domain: authorize URL and allowlisted callback errors.
 * The backend only exposes `/auth/social/*` when SOCIAL_LOGIN_ENABLED=true;
 * `/meta.social` tells the SPA whether to render the button. */

import { API_BASE } from "@/lib/constants";

export function socialAuthorizeUrl(provider: string): string {
  return `${API_BASE}/auth/social/${encodeURIComponent(provider)}/authorize`;
}

const ERRORS: Record<string, string> = {
  cancelled: "Sign-in was cancelled at your identity provider.",
  state: "That sign-in link expired or was already used. Please try again.",
  provider: "Your identity provider could not complete the sign-in. Please try again.",
  email: "Your provider did not return a verified email address, so we could not link the account.",
  rate: "Too many attempts. Wait a moment and try again.",
  disabled: "Social sign-in is not enabled on this server.",
};

/** Map the allowlisted `social_error` code to user-facing copy (never raw data). */
export function socialErrorMessage(code: string | null | undefined): string | null {
  if (!code) return null;
  return ERRORS[code] ?? "Social sign-in failed. Please try again.";
}
