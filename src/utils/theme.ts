/**
 * Global Theme Engine - Manages Light, Dark, and System preference synchronization.
 */
export type Theme = "light" | "dark" | "system";

export const applyTheme = (theme: Theme) => {
  localStorage.setItem("theme", theme);

  if (theme === "dark") {
    document.documentElement.classList.add("dark");
  } else if (theme === "light") {
    document.documentElement.classList.remove("dark");
  } else {
    const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    document.documentElement.classList.toggle("dark", isDark);
  }
};

export const loadTheme = () => {
  const saved = (localStorage.getItem("theme") as Theme) || "system";
  applyTheme(saved);

  // Synchronize System Theme transitions
  const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
  const synchronize = (e: MediaQueryListEvent) => {
    const currentTheme = localStorage.getItem("theme") as Theme;
    if (currentTheme === "system") {
      document.documentElement.classList.toggle("dark", e.matches);
    }
  };

  mediaQuery.addEventListener("change", synchronize);
};

export const getTheme = (): Theme => {
  return (localStorage.getItem("theme") as Theme) || "system";
};
