/**
 * useDarkMode — global dark mode hook
 * Import di setiap page:
 *   import { useDarkMode, darkModeCSS } from "../../utils/darkMode";
 *   const { darkMode, toggleDarkMode } = useDarkMode();
 *
 * Lalu di JSX tambahkan <style>{darkModeCSS}</style> sekali di root,
 * dan pakai CSS variables (--bg-primary, --text-primary, dll) di semua styling.
 */

import { useState, useEffect } from "react";

export function useDarkMode() {
    const [darkMode, setDarkMode] = useState(
        () => localStorage.getItem("atap_theme") === "dark"
    );

    useEffect(() => {
        if (darkMode) {
            document.documentElement.classList.add("dark-mode");
            localStorage.setItem("atap_theme", "dark");
        } else {
            document.documentElement.classList.remove("dark-mode");
            localStorage.setItem("atap_theme", "light");
        }
    }, [darkMode]);

    // Sync antar tab/page
    useEffect(() => {
        const onStorage = (e) => {
            if (e.key === "atap_theme") {
                const isDark = e.newValue === "dark";
                setDarkMode(isDark);
            }
        };
        window.addEventListener("storage", onStorage);
        return () => window.removeEventListener("storage", onStorage);
    }, []);

    return { darkMode, toggleDarkMode: () => setDarkMode((p) => !p) };
}

/**
 * CSS Variables global — paste <style>{darkModeCSS}</style> di setiap page root.
 * Semua halaman pakai variabel yang sama sehingga dark mode konsisten.
 */
export const darkModeCSS = `
  :root {
    --bg-primary: #F8FAFC;
    --bg-secondary: #FFFFFF;
    --bg-tertiary: #F1F5F9;
    --bg-card: #FFFFFF;
    --bg-input: #F8FAFC;
    --text-primary: #0F172A;
    --text-secondary: #64748B;
    --text-muted: #94A3B8;
    --border-color: #E2E8F0;
    --border-light: #F1F5F9;
    --shadow-sm: 0 1px 3px rgba(0,0,0,0.08);
    --shadow-md: 0 4px 16px rgba(0,0,0,0.08);
    --accent: #2563EB;
    --accent-light: #EFF6FF;
    --accent-border: #BFDBFE;
    --danger: #EF4444;
    --danger-light: #FEF2F2;
    --success: #22C55E;
    --success-light: #F0FDF4;
    --warning: #F59E0B;
    --warning-light: #FFFBEB;
  }

  .dark-mode {
    --bg-primary: #0F172A;
    --bg-secondary: #1E293B;
    --bg-tertiary: #334155;
    --bg-card: #1E293B;
    --bg-input: #0F172A;
    --text-primary: #F1F5F9;
    --text-secondary: #CBD5E1;
    --text-muted: #64748B;
    --border-color: #334155;
    --border-light: #1E293B;
    --shadow-sm: 0 1px 3px rgba(0,0,0,0.3);
    --shadow-md: 0 4px 16px rgba(0,0,0,0.3);
    --accent: #3B82F6;
    --accent-light: rgba(59,130,246,0.12);
    --accent-border: rgba(59,130,246,0.3);
    --danger: #F87171;
    --danger-light: rgba(239,68,68,0.12);
    --success: #4ADE80;
    --success-light: rgba(34,197,94,0.12);
    --warning: #FCD34D;
    --warning-light: rgba(245,158,11,0.12);
  }

  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { margin: 0; background: var(--bg-primary); color: var(--text-primary); transition: background 0.25s, color 0.25s; }

  /* ── Scrollbar ── */
  ::-webkit-scrollbar { width: 6px; height: 6px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: var(--border-color); border-radius: 99px; }
  .dark-mode ::-webkit-scrollbar-thumb { background: #334155; }

  /* ── Common reusable classes ── */
  .dm-card {
    background: var(--bg-card);
    border: 1px solid var(--border-color);
    border-radius: 16px;
    box-shadow: var(--shadow-sm);
    transition: background 0.25s, border-color 0.25s;
  }

  .dm-input {
    background: var(--bg-input);
    border: 1.5px solid var(--border-color);
    color: var(--text-primary);
    font-family: inherit;
    outline: none;
    transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
  }
  .dm-input:focus {
    border-color: var(--accent);
    background: var(--bg-secondary);
    box-shadow: 0 0 0 3px var(--accent-light);
  }
  .dm-input::placeholder { color: var(--text-muted); }

  .dm-btn-primary {
    background: var(--accent);
    color: white;
    border: none;
    cursor: pointer;
    font-family: inherit;
    font-weight: 700;
    transition: opacity 0.2s, transform 0.15s, box-shadow 0.2s;
  }
  .dm-btn-primary:hover { opacity: 0.92; transform: translateY(-1px); }
  .dm-btn-primary:active { transform: translateY(0); }

  .dm-btn-outline {
    background: var(--bg-secondary);
    color: var(--text-secondary);
    border: 1.5px solid var(--border-color);
    cursor: pointer;
    font-family: inherit;
    font-weight: 600;
    transition: border-color 0.2s, color 0.2s, background 0.2s;
  }
  .dm-btn-outline:hover {
    border-color: var(--accent);
    color: var(--accent);
    background: var(--accent-light);
  }

  .dm-label {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.6px;
    text-transform: uppercase;
    color: var(--text-secondary);
    margin-bottom: 8px;
    display: block;
  }

  .dm-section-title {
    font-size: 20px;
    font-weight: 800;
    color: var(--text-primary);
    letter-spacing: -0.5px;
  }

  .dm-text-secondary { color: var(--text-secondary); }
  .dm-text-muted { color: var(--text-muted); }
  .dm-text-accent { color: var(--accent); }

  .dm-divider {
    border: none;
    border-top: 1px solid var(--border-color);
    margin: 0;
  }

  /* ── Skeleton pulse ── */
  .dm-skeleton {
    background: var(--bg-tertiary);
    border-radius: 8px;
    animation: dmPulse 1.4s infinite;
  }
  @keyframes dmPulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }

  /* ── Bottom nav dark ── */
  .dark-mode .atap-bottom-nav {
    background: rgba(30,41,59,0.97);
  }
`;