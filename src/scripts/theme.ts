// Theme state, imported only by the header (one importer keeps its script
// inline). The command palette reads <html data-theme>, listens for
// "themechange" and asks for changes with a "themerequest" event.
// "system" = no stored choice: color-scheme follows the OS (works without JS).

export type ThemeChoice = "light" | "dark" | "system";

export function readTheme(): ThemeChoice {
  try {
    const stored = localStorage.getItem("theme");
    return stored === "light" || stored === "dark" ? stored : "system";
  } catch {
    return "system";
  }
}

export function setTheme(choice: ThemeChoice) {
  const apply = () => {
    const root = document.documentElement;
    if (choice === "system") delete root.dataset.theme;
    else root.dataset.theme = choice;
    try {
      if (choice === "system") localStorage.removeItem("theme");
      else localStorage.setItem("theme", choice);
    } catch {
      // Storage unavailable: the choice lasts for this page view.
    }
    document.dispatchEvent(new CustomEvent("themechange", { detail: choice }));
  };
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!reduce && "startViewTransition" in document) document.startViewTransition(apply);
  else apply();
}
