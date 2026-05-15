// apps/storefront/Layout.jsx
// Wraps all storefront pages with:
//   - CartProvider (global cart state)
//   - Header with nav + cart icon
//   - Footer
//   - <Outlet /> for child routes (React Router)
//
// Exports:
//   useCartState()    → { items, count, total, isOpen }
//   useCartDispatch() → dispatch({ type, payload })

import { createContext, useContext, useReducer } from "react";
import { Outlet, Link, NavLink, useNavigate } from "react-router-dom";
import { useTheme } from "./ThemeContext";

// ─── Cart Context & Reducer ────────────────────────────────────────────────────

const CartStateCtx    = createContext(null);
const CartDispatchCtx = createContext(null);

function cartReducer(state, action) {
  switch (action.type) {
    case "ADD_ITEM": {
      const key = (i) => `${i.id}__${i.variantId ?? "default"}`;
      const exists = state.items.find((i) => key(i) === key(action.payload));
      if (exists) {
        return {
          ...state,
          items: state.items.map((i) =>
            key(i) === key(action.payload)
              ? { ...i, quantity: i.quantity + (action.payload.quantity ?? 1) }
              : i
          ),
        };
      }
      return {
        ...state,
        items: [...state.items, { ...action.payload, quantity: action.payload.quantity ?? 1 }],
      };
    }
    case "REMOVE_ITEM": {
      const key = `${action.payload.id}__${action.payload.variantId ?? "default"}`;
      return { ...state, items: state.items.filter((i) => `${i.id}__${i.variantId ?? "default"}` !== key) };
    }
    case "UPDATE_QTY": {
      const key = `${action.payload.id}__${action.payload.variantId ?? "default"}`;
      if (action.payload.quantity <= 0)
        return { ...state, items: state.items.filter((i) => `${i.id}__${i.variantId ?? "default"}` !== key) };
      return {
        ...state,
        items: state.items.map((i) =>
          `${i.id}__${i.variantId ?? "default"}` === key ? { ...i, quantity: action.payload.quantity } : i
        ),
      };
    }
    case "CLEAR":
      return { ...state, items: [] };
    case "TOGGLE_CART":
      return { ...state, isOpen: action.payload ?? !state.isOpen };
    default:
      return state;
  }
}

function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [], isOpen: false });
  const derived = {
    ...state,
    count: state.items.reduce((n, i) => n + i.quantity, 0),
    total: state.items.reduce((s, i) => s + i.price * i.quantity, 0),
  };
  return (
    <CartStateCtx.Provider value={derived}>
      <CartDispatchCtx.Provider value={dispatch}>
        {children}
      </CartDispatchCtx.Provider>
    </CartStateCtx.Provider>
  );
}

export function useCartState()    { return useContext(CartStateCtx); }
export function useCartDispatch() { return useContext(CartDispatchCtx); }

// ─── Header ───────────────────────────────────────────────────────────────────

function Header() {
  const cart     = useCartState();
  const dispatch = useCartDispatch();
  const navigate = useNavigate();
  const { theme, toggleTheme, isDark } = useTheme();

  const navStyle = ({ isActive }) => ({
    textDecoration: "none",
    color: isActive ? "#7c6aff" : isDark ? "#aaa" : "#666",
    fontSize: 14,
    fontWeight: 500,
    transition: "color 0.15s",
  });

  const headerStyle = {
    ...s.header,
    background: isDark ? "rgba(12,12,14,0.9)" : "rgba(245,245,247,0.9)",
    borderBottom: `1px solid ${isDark ? "#2a2a31" : "#e0e0e8"}`,
  };

  const logoStyle = {
    ...s.logo,
    color: isDark ? "#e8e8f0" : "#111118",
  };

  const cartBtnStyle = {
    ...s.cartBtn,
    color: isDark ? "#e8e8f0" : "#111118",
  };

  return (
    <header style={headerStyle}>
      <Link to="/" style={logoStyle}>commit&amp;conquer</Link>

      <nav style={s.nav}>
        <NavLink to="/"           end style={navStyle}>Shop</NavLink>
        <NavLink to="/collections"    style={navStyle}>Collections</NavLink>
        <NavLink to="/about"          style={navStyle}>About</NavLink>
        <NavLink to="/account"        style={navStyle}>Account</NavLink>
        {/* Admin link — for hackathon convenience */}
        <NavLink to="/admin"          style={({ isActive }) => ({
          ...navStyle({ isActive }),
          background: isActive ? "rgba(124,106,255,0.15)" : isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
          padding: "4px 10px", borderRadius: 6, fontSize: 13,
        })}>Admin ↗</NavLink>
      </nav>

      {/* ── Theme Toggle ── */}
      <button
        id="theme-toggle-btn"
        onClick={toggleTheme}
        aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
        title={isDark ? "Switch to light mode" : "Switch to dark mode"}
        style={{
          background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)",
          border: `1px solid ${isDark ? "#2a2a31" : "#ddd"}`,
          cursor: "pointer",
          color: isDark ? "#e8e8f0" : "#333",
          padding: "6px 10px",
          borderRadius: 8,
          display: "flex",
          alignItems: "center",
          gap: 6,
          fontSize: 13,
          fontWeight: 500,
          transition: "all 0.2s",
          marginLeft: 4,
        }}
      >
        {isDark ? (
          <>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="5"/>
              <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
            </svg>
            Light
          </>
        ) : (
          <>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
            </svg>
            Dark
          </>
        )}
      </button>

      <button
        onClick={() => dispatch({ type: "TOGGLE_CART", payload: true })}
        style={cartBtnStyle}
        aria-label="Open cart"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
          <line x1="3" y1="6" x2="21" y2="6"/>
          <path d="M16 10a4 4 0 01-8 0"/>
        </svg>
        {cart?.count > 0 && <span style={s.badge}>{cart.count > 99 ? "99+" : cart.count}</span>}
      </button>
    </header>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────

function Footer() {
  const { isDark } = useTheme();
  return (
    <footer style={{ ...s.footer, borderTop: `1px solid ${isDark ? "#1c1c21" : "#e8e8f0"}` }}>
      <div style={s.footerInner}>
        <span style={{ color: isDark ? "#555" : "#999", fontSize: 13 }}>© {new Date().getFullYear()} Commit &amp; Conquer</span>
        <div style={{ display: "flex", gap: 20 }}>
          <Link to="/about"       style={{ ...s.footerLink, color: isDark ? "#555" : "#888" }}>About</Link>
          <Link to="/collections" style={{ ...s.footerLink, color: isDark ? "#555" : "#888" }}>Collections</Link>
          <Link to="/account"     style={{ ...s.footerLink, color: isDark ? "#555" : "#888" }}>Account</Link>
        </div>
      </div>
    </footer>
  );
}

// ─── Root Layout ──────────────────────────────────────────────────────────────

export default function Layout() {
  const { isDark } = useTheme();
  return (
    <CartProvider>
      <div style={{ ...s.root, background: isDark ? "#0c0c0e" : "#f5f5f7", color: isDark ? "#e8e8f0" : "#111118" }}>
        <Header />
        <main style={s.main}>
          <Outlet />   {/* React Router renders child page here */}
        </main>
        <Footer />
      </div>
    </CartProvider>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = {
  root:    { minHeight: "100vh", display: "flex", flexDirection: "column", background: "#0c0c0e", color: "#e8e8f0" },
  header:  {
    position: "sticky", top: 0, zIndex: 100,
    display: "flex", alignItems: "center", gap: 24,
    padding: "0 32px", height: 60,
    background: "rgba(12,12,14,0.9)", backdropFilter: "blur(12px)",
    borderBottom: "1px solid #2a2a31",
  },
  logo:    { fontWeight: 800, fontSize: 17, textDecoration: "none", color: "#e8e8f0", letterSpacing: "-0.5px", marginRight: "auto" },
  nav:     { display: "flex", alignItems: "center", gap: 20 },
  cartBtn: {
    position: "relative", background: "none", border: "none",
    cursor: "pointer", color: "#e8e8f0", padding: "6px 8px",
    borderRadius: 8, marginLeft: 8, display: "flex", alignItems: "center",
  },
  badge:   {
    position: "absolute", top: 0, right: 0,
    background: "#7c6aff", color: "#fff",
    fontSize: 10, fontWeight: 700, borderRadius: "50%",
    width: 17, height: 17, display: "flex", alignItems: "center", justifyContent: "center",
  },
  main:    { flex: 1 },
  footer:  { borderTop: "1px solid #1c1c21", padding: "24px 32px" },
  footerInner: { maxWidth: 1200, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" },
  footerLink: { color: "#555", textDecoration: "none", fontSize: 13 },
};