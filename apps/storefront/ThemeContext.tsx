// apps/storefront/ThemeContext.tsx
// Global dark/light theme context.
// Injects CSS custom properties on <html> so inline styles & CSS can both react.
//
// Usage:
//   import { useTheme } from "./ThemeContext";
//   const { theme, toggleTheme } = useTheme();

import { createContext, useContext, useEffect, useState } from "react";

export type Theme = "dark" | "light";

interface ThemeCtx {
  theme: Theme;
  toggleTheme: () => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeCtx>({
  theme: "dark",
  toggleTheme: () => {},
  isDark: true,
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    try {
      return (localStorage.getItem("cc-theme") as Theme) ?? "dark";
    } catch {
      return "dark";
    }
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.style.setProperty("--bg-primary",    "#0c0c0e");
      root.style.setProperty("--bg-secondary",  "#0a0a0c");
      root.style.setProperty("--bg-card",        "#111114");
      root.style.setProperty("--bg-header",      "rgba(12,12,14,0.9)");
      root.style.setProperty("--border-color",   "#2a2a31");
      root.style.setProperty("--border-subtle",  "#1c1c21");
      root.style.setProperty("--text-primary",   "#e8e8f0");
      root.style.setProperty("--text-secondary", "#aaa");
      root.style.setProperty("--text-muted",     "#555");
      root.style.setProperty("--accent",         "#7c6aff");
      root.style.setProperty("--accent-bg",      "rgba(124,106,255,0.15)");
      root.setAttribute("data-theme", "dark");
    } else {
      root.style.setProperty("--bg-primary",    "#f5f5f7");
      root.style.setProperty("--bg-secondary",  "#ffffff");
      root.style.setProperty("--bg-card",        "#ffffff");
      root.style.setProperty("--bg-header",      "rgba(245,245,247,0.9)");
      root.style.setProperty("--border-color",   "#e0e0e8");
      root.style.setProperty("--border-subtle",  "#ebebf0");
      root.style.setProperty("--text-primary",   "#111118");
      root.style.setProperty("--text-secondary", "#555");
      root.style.setProperty("--text-muted",     "#999");
      root.style.setProperty("--accent",         "#5b4cdf");
      root.style.setProperty("--accent-bg",      "rgba(91,76,223,0.1)");
      root.setAttribute("data-theme", "light");
    }
    document.body.style.background = theme === "dark" ? "#0c0c0e" : "#f5f5f7";
    document.body.style.color      = theme === "dark" ? "#e8e8f0" : "#111118";
    try { localStorage.setItem("cc-theme", theme); } catch {}
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isDark: theme === "dark" }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
