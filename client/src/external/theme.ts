/* Browser theme integration (external to our backend contract). */

const DARK_CLASS = "dark";

export function isDarkTheme(): boolean {
  return document.documentElement.classList.contains(DARK_CLASS);
}

export function applyTheme(dark: boolean): void {
  document.documentElement.classList.toggle(DARK_CLASS, dark);
}
