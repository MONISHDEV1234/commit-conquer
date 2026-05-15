// apps/storefront/pages/admin/AdminLayout.tsx
// Wraps all /admin/* routes with sidebar navigation

import { NavLink, Outlet, Link } from "react-router-dom";
import { useTheme } from "../../ThemeContext";

const NAV = [
  { to: "/admin",          label: "Dashboard", icon: "⬡", end: true },
  { to: "/admin/products", label: "Products",  icon: "◈" },
  { to: "/admin/orders",   label: "Orders",    icon: "○" },
];

export default function AdminLayout() {
  const { isDark, toggleTheme } = useTheme();

  const rootStyle = { ...s.root, background: isDark ? "#0c0c0e" : "#f0f0f5", color: isDark ? "#e8e8f0" : "#111118" };
  const sidebarStyle = { ...s.sidebar, background: isDark ? "#0a0a0c" : "#ffffff", borderRight: `1px solid ${isDark ? "#1c1c21" : "#e0e0e8"}` };
  const logoWrapStyle = { ...s.logoWrap, borderBottom: `1px solid ${isDark ? "#1c1c21" : "#e0e0e8"}` };
  const logoStyle = { ...s.logo, color: isDark ? "#e8e8f0" : "#111118" };
  const sidebarFooterStyle = { ...s.sidebarFooter, borderTop: `1px solid ${isDark ? "#1c1c21" : "#e0e0e8"}` };
  const backLinkStyle = { ...s.backLink, color: isDark ? "#555" : "#888" };

  return (
    <div style={rootStyle}>
      {/* Sidebar */}
      <aside style={sidebarStyle}>
        <div style={logoWrapStyle}>
          <Link to="/" style={logoStyle}>commit&amp;conquer</Link>
          <span style={s.badge}>Admin</span>
        </div>

        <nav style={s.nav}>
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              style={({ isActive }: { isActive: boolean }) => ({
                ...s.navItem,
                background: isActive ? "rgba(124,106,255,0.15)" : "transparent",
                color:      isActive ? "#7c6aff" : isDark ? "#888" : "#666",
              })}
            >
              <span style={s.navIcon}>{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div style={sidebarFooterStyle}>
          {/* Theme Toggle */}
          <button
            id="admin-theme-toggle-btn"
            onClick={toggleTheme}
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              width: "100%", marginBottom: 10,
              background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)",
              border: `1px solid ${isDark ? "#2a2a31" : "#ddd"}`,
              cursor: "pointer",
              color: isDark ? "#ccc" : "#444",
              padding: "7px 12px",
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 500,
              transition: "all 0.2s",
            }}
          >
            {isDark ? (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="5"/>
                  <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
                </svg>
                Light Mode
              </>
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
                </svg>
                Dark Mode
              </>
            )}
          </button>
          <Link to="/" style={backLinkStyle}>← Back to Store</Link>
        </div>
      </aside>

      {/* Content */}
      <main style={s.main}>
        <Outlet />
      </main>
    </div>
  );
}

const s: Record<string, any> = {
  root:    { display: "flex", minHeight: "100vh", background: "#0c0c0e", color: "#e8e8f0" },
  sidebar: { width: 220, background: "#0a0a0c", borderRight: "1px solid #1c1c21", display: "flex", flexDirection: "column", flexShrink: 0, position: "sticky", top: 0, height: "100vh" },
  logoWrap: { padding: "24px 20px 20px", borderBottom: "1px solid #1c1c21", display: "flex", alignItems: "center", gap: 8 },
  logo:    { fontWeight: 800, fontSize: 14, textDecoration: "none", color: "#e8e8f0" },
  badge:   { fontSize: 10, fontWeight: 700, padding: "2px 8px", background: "rgba(124,106,255,0.2)", color: "#7c6aff", borderRadius: 4 },
  nav:     { flex: 1, padding: "12px 10px", display: "flex", flexDirection: "column", gap: 4 },
  navItem: { display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 8, textDecoration: "none", fontSize: 14, fontWeight: 500, transition: "all 0.15s" },
  navIcon: { fontSize: 16 },
  sidebarFooter: { padding: "16px 20px", borderTop: "1px solid #1c1c21" },
  backLink: { color: "#555", textDecoration: "none", fontSize: 13 },
  main:    { flex: 1, padding: "32px 36px", overflowX: "auto" },
};