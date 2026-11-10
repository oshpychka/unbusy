export type ThemePreference = "light" | "dark" | "system";

export const themeStorageKey = "unbusy-theme";

export const themeScript = `(function(){try{var p=localStorage.getItem("${themeStorageKey}");var d=p==="dark"||(p!=="light"&&matchMedia("(prefers-color-scheme: dark)").matches);document.documentElement.dataset.theme=d?"dark":"light"}catch(e){document.documentElement.dataset.theme="light"}})()`;

export function readThemePreference(): ThemePreference {
  try {
    const value = localStorage.getItem(themeStorageKey);
    return value === "light" || value === "dark" ? value : "system";
  } catch {
    return "system";
  }
}

export function resolveTheme(preference: ThemePreference): "light" | "dark" {
  if (preference !== "system") return preference;
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export function applyThemePreference(preference: ThemePreference) {
  try {
    if (preference === "system") localStorage.removeItem(themeStorageKey);
    else localStorage.setItem(themeStorageKey, preference);
  } catch {}
  document.documentElement.dataset.theme = resolveTheme(preference);
  window.dispatchEvent(new Event("unbusy-theme"));
}

export function subscribeToTheme(callback: () => void) {
  const media = window.matchMedia("(prefers-color-scheme: dark)");
  const onSystemChange = () => {
    if (readThemePreference() === "system") applyThemePreference("system");
  };
  media.addEventListener("change", onSystemChange);
  window.addEventListener("unbusy-theme", callback);
  window.addEventListener("storage", callback);
  return () => {
    media.removeEventListener("change", onSystemChange);
    window.removeEventListener("unbusy-theme", callback);
    window.removeEventListener("storage", callback);
  };
}
