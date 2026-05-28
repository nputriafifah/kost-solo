import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  MessageCircle, Moon, Sun, User, Settings, LogOut,
} from "lucide-react";
import { useUserNavBadges } from "../../hooks/useUserNavBadges";

const DESKTOP_LINKS = [
  { label: "Home", path: "/" },
  { label: "Search", path: "/search" },
  { label: "Peta", path: "/map" },
  { label: "Favorit", path: "/like" },
];

export const USER_NAVBAR_CSS = `
  :root {
    --bg-primary: #F8FAFC;
    --bg-secondary: #FFFFFF;
    --bg-tertiary: #F1F5F9;
    --text-primary: #0F172A;
    --text-secondary: #64748B;
    --border-color: #E2E8F0;
    --card-shadow: 0 1px 3px rgba(0,0,0,0.1);
  }
  .dark-mode {
    --bg-primary: #0F172A;
    --bg-secondary: #1E293B;
    --bg-tertiary: #334155;
    --text-primary: #F8FAFC;
    --text-secondary: #CBD5E1;
    --border-color: #334155;
    --card-shadow: 0 1px 3px rgba(0,0,0,0.3);
  }

  .atap-navbar {
    position: sticky; top: 0; z-index: 100;
    height: 72px;
    background: rgba(255,255,255,0.92);
    backdrop-filter: blur(16px);
    border-bottom: 1px solid var(--border-color);
    display: flex; align-items: center; justify-content: space-between;
    padding: 0 42px;
  }
  .dark-mode .atap-navbar { background: rgba(30,41,59,0.92); }
  .atap-navbar-logo {
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 25px; font-weight: 800; letter-spacing: -1px;
    color: var(--text-primary); cursor: pointer;
  }
  .atap-navbar-logo span { color: #2563EB; }
  .atap-navbar-links { display: flex; align-items: center; gap: 4px; }
  .atap-navbar-link {
    font-size: 14px; font-weight: 600; color: var(--text-secondary);
    cursor: pointer; padding: 7px 11px; border-radius: 9px;
    transition: 0.15s; font-family: 'DM Sans', sans-serif;
  }
  .atap-navbar-link:hover { color: #2563EB; background: #EFF6FF; }
  .dark-mode .atap-navbar-link:hover { background: rgba(59,130,246,0.15); }
  .atap-navbar-link.active { color: #2563EB; }
  .atap-navbar-divider {
    width: 1px; height: 22px; background: var(--border-color); margin: 0 6px;
  }
  .atap-theme-toggle {
    display: flex; align-items: center; justify-content: center;
    width: 36px; height: 36px; border-radius: 50%;
    background: var(--bg-tertiary); border: 1.5px solid var(--border-color);
    cursor: pointer; transition: 0.2s; color: var(--text-primary); margin-left: 2px;
  }
  .atap-theme-toggle:hover { background: #EFF6FF; color: #2563EB; }
  .dark-mode .atap-theme-toggle:hover { background: rgba(59,130,246,0.15); }
  .atap-chat-btn-wrap { position: relative; display: inline-flex; margin-left: 2px; cursor: pointer; }
  .atap-chat-btn {
    width: 36px; height: 36px; border-radius: 50%;
    background: var(--bg-tertiary); color: var(--text-secondary);
    display: flex; align-items: center; justify-content: center;
    border: 1.5px solid var(--border-color); transition: 0.2s;
  }
  .atap-chat-btn:hover { background: #EFF6FF; color: #2563EB; border-color: #BFDBFE; }
  .dark-mode .atap-chat-btn:hover { background: rgba(59,130,246,0.15); }
  .atap-chat-badge {
    position: absolute; top: -3px; right: -3px;
    min-width: 16px; height: 16px; background: #EF4444; border-radius: 999px;
    border: 2px solid var(--bg-secondary);
    display: flex; align-items: center; justify-content: center;
    font-size: 9px; font-weight: 800; color: white; padding: 0 3px; line-height: 1;
    pointer-events: none; box-shadow: 0 0 0 2px rgba(239,68,68,.2);
  }
  .atap-mobile-chat { display: none; }
  .atap-dropdown-wrap { position: relative; }
  .atap-avatar-wrap { position: relative; display: inline-block; margin-left: 4px; }
  .atap-notif-dot {
    position: absolute; top: -2px; right: -2px; width: 10px; height: 10px;
    background: #EF4444; border-radius: 50%; border: 2.5px solid var(--bg-secondary);
    box-shadow: 0 0 0 2px rgba(239,68,68,.22); pointer-events: none;
  }
  .atap-navbar-avatar {
    width: 36px; height: 36px; border-radius: 50%;
    background: #DBEAFE; color: #1D4ED8; font-size: 12px; font-weight: 700;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; border: 2px solid #BFDBFE; transition: 0.2s;
    font-family: 'DM Sans', sans-serif;
  }
  .atap-navbar-avatar:hover { background: #BFDBFE; transform: scale(1.05); }
  .atap-navbar-dropdown {
    position: absolute; top: calc(100% + 10px); right: 0;
    background: var(--bg-secondary); border: 1px solid var(--border-color);
    border-radius: 16px; padding: 8px; min-width: 175px;
    box-shadow: var(--card-shadow); display: flex; flex-direction: column;
    gap: 2px; z-index: 200; animation: atapDdFadeIn 0.15s ease;
  }
  @keyframes atapDdFadeIn {
    from { opacity: 0; transform: translateY(-6px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .atap-navbar-dropdown button {
    display: flex; align-items: center; gap: 10px;
    padding: 10px 13px; border: none; background: none; border-radius: 10px;
    font-size: 13px; font-weight: 600; color: var(--text-secondary);
    cursor: pointer; width: 100%; text-align: left; transition: 0.13s;
    font-family: 'DM Sans', sans-serif;
  }
  .atap-navbar-dropdown button:hover {
    background: var(--bg-tertiary); color: var(--text-primary);
  }
  .atap-navbar-dropdown .dd-divider {
    height: 1px; background: var(--border-color); margin: 4px 0;
  }
  .atap-navbar-dropdown button.danger { color: #EF4444; }
  .atap-navbar-dropdown button.danger:hover { background: #FEF2F2; }
  .dark-mode .atap-navbar-dropdown button.danger:hover {
    background: rgba(239,68,68,0.15);
  }

  @media (max-width: 768px) {
    .atap-navbar { padding: 0 16px; height: 60px; }
    .atap-navbar-links { display: none; }
    .atap-mobile-chat { display: flex; }
  }
`;

export default function UserNavbar({ badges: badgesProp, activePath: activePathProp }) {
  const navigate = useNavigate();
  const location = useLocation();
  const menuRef = useRef(null);
  const [showMenu, setShowMenu] = useState(false);

  const internalBadges = useUserNavBadges();
  const badges = badgesProp ?? internalBadges;
  const activePath = activePathProp ?? location.pathname;
  const {
    unreadChat,
    unreadCount,
    darkMode,
    setDarkMode,
    doLogout,
    initials,
    userName,
    isLoggedIn,
  } = badges;

  useEffect(() => {
    const h = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setShowMenu(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const isLinkActive = (path) => {
    if (path === "/") return activePath === "/";
    return activePath === path || activePath.startsWith(`${path}/`);
  };

  return (
    <nav className="atap-navbar">
      <div className="atap-navbar-logo" onClick={() => navigate("/")}>
        Atap<span>.</span>
      </div>

      <div className="atap-navbar-links">
        {isLoggedIn ? (
          <>
            {DESKTOP_LINKS.map(({ label, path }) => (
              <span
                key={path}
                className={`atap-navbar-link${isLinkActive(path) ? " active" : ""}`}
                onClick={() => navigate(path)}
              >
                {label}
              </span>
            ))}
            <div className="atap-navbar-divider" />
            <div className="atap-chat-btn-wrap" onClick={() => navigate("/chat")} title="Chat">
              <div className="atap-chat-btn">
                <MessageCircle size={16} />
              </div>
              {unreadChat > 0 && (
                <span className="atap-chat-badge">
                  {unreadChat > 99 ? "99+" : unreadChat}
                </span>
              )}
            </div>
            <button
              type="button"
              className="atap-theme-toggle"
              onClick={() => setDarkMode(!darkMode)}
              title={darkMode ? "Mode Terang" : "Mode Gelap"}
            >
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <div className="atap-dropdown-wrap" ref={menuRef}>
              <div className="atap-avatar-wrap">
                <div
                  className="atap-navbar-avatar"
                  onClick={() => setShowMenu((p) => !p)}
                  title={userName}
                >
                  {initials}
                </div>
                {unreadCount > 0 && <span className="atap-notif-dot" />}
              </div>
              {showMenu && (
                <div className="atap-navbar-dropdown">
                  <button
                    type="button"
                    onClick={() => {
                      navigate("/profil");
                      setShowMenu(false);
                    }}
                  >
                    <User size={14} /> Profil
                    {unreadCount > 0 && (
                      <span
                        style={{
                          marginLeft: "auto",
                          fontSize: 10,
                          fontWeight: 700,
                          color: "#EF4444",
                          background: "#FEF2F2",
                          padding: "2px 7px",
                          borderRadius: 99,
                        }}
                      >
                        {unreadCount} baru
                      </span>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      navigate("/settings/account");
                      setShowMenu(false);
                    }}
                  >
                    <Settings size={14} /> Pengaturan
                  </button>
                  <div className="dd-divider" />
                  <button type="button" className="danger" onClick={doLogout}>
                    <LogOut size={14} /> Logout
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            {DESKTOP_LINKS.slice(0, 3).map(({ label, path }) => (
              <span
                key={path}
                className="atap-navbar-link"
                onClick={() => navigate(path)}
              >
                {label}
              </span>
            ))}
            <div className="atap-navbar-divider" />
            <button
              type="button"
              className="atap-theme-toggle"
              onClick={() => setDarkMode(!darkMode)}
            >
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <span className="atap-navbar-link" onClick={() => navigate("/auth")}>
              Masuk
            </span>
          </>
        )}
      </div>

      {isLoggedIn && (
        <div
          className="atap-chat-btn-wrap atap-mobile-chat"
          onClick={() => navigate("/chat")}
          title="Chat"
        >
          <div className="atap-chat-btn">
            <MessageCircle size={16} />
          </div>
          {unreadChat > 0 && (
            <span className="atap-chat-badge">
              {unreadChat > 99 ? "99+" : unreadChat}
            </span>
          )}
        </div>
      )}
    </nav>
  );
}
