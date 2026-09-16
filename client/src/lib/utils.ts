import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/* 4-letter project code for sidebar mini avatars. Projects have no backend
 * slug (id/org_id/name only), so this derives a stable code from the name
 * (diacritics stripped, e.g. "Apollo" -> "APOL"). */
export function projectCode(name: string): string {
  const code = name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .slice(0, 4)
    .toUpperCase();
  return code === "" ? "–" : code;
}
