import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { User, Settings, LogOut } from "lucide-react";
import { useUserNavBadges } from "../../hooks/useUserNavBadges";

import { USER_DESKTOP_LINKS, isUserNavActive } from "../../constants/userNav";

const DESKTOP_LINKS = USER_DESKTOP_LINKS.map(({ label, path }) => ({ label, path }));

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

  .atap-navbar {
    position: sticky; top: 0; z-index: 100;
    height: 72px;
    background: rgba(255,255,255,0.92);
    backdrop-filter: blur(16px);
    border-bottom: 1px solid var(--border-color);
    display: flex; align-items: center; justify-content: space-between;
    padding: 0 42px;
  }
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
  .atap-navbar-link.active { color: #2563EB; background: #EFF6FF; }
  .atap-navbar-login {
    font-size: 14px; font-weight: 600; color: var(--text-secondary);
    cursor: pointer; padding: 7px 11px; border-radius: 9px;
    transition: 0.15s; font-family: 'DM Sans', sans-serif;
  }
  .atap-navbar-login:hover { color: #2563EB; background: #EFF6FF; }
  .atap-navbar-cta {
    border: none; cursor: pointer; padding: 11px 22px; border-radius: 12px;
    background: linear-gradient(135deg, #2563EB, #3B82F6); color: #fff;
    font-size: 13px; font-weight: 700; transition: 0.2s;
    font-family: 'DM Sans', sans-serif; flex-shrink: 0;
  }
  .atap-navbar-cta:hover {
    transform: translateY(-1px); box-shadow: 0 12px 25px rgba(37, 99, 235, 0.22);
  }
  .atap-navbar-divider {
    width: 1px; height: 22px; background: var(--border-color); margin: 0 6px;
  }
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

  @media (max-width: 768px) {
    .atap-navbar { padding: 0 16px; height: 60px; }
    .atap-navbar-links { display: none; }
    .atap-navbar-links--guest {
      display: flex !important; align-items: center; gap: 6px;
    }
    .atap-navbar-links--guest .atap-nav-desktop-only { display: none; }
    .atap-navbar-links--guest .atap-navbar-divider { display: none; }
    .atap-navbar-links--guest .atap-navbar-cta {
      padding: 9px 14px; font-size: 12px;
    }
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
    unreadCount,
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

  const isLinkActive = (path) => isUserNavActive(activePath, path);

  return (
    <nav className="atap-navbar">
      <div className="atap-navbar-logo" onClick={() => navigate("/")}>
        Atap<span>.</span>
      </div>

      <div className={`atap-navbar-links${isLoggedIn ? "" : " atap-navbar-links--guest"}`}>
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
            {DESKTOP_LINKS.slice(0, 2).map(({ label, path }) => (
              <span
                key={path}
                className={`atap-navbar-link atap-nav-desktop-only${isLinkActive(path) ? " active" : ""}`}
                onClick={() => navigate(path)}
              >
                {label}
              </span>
            ))}
            <div className="atap-navbar-divider atap-nav-desktop-only" />
            <span className="atap-navbar-login" onClick={() => navigate("/auth")}>
              Masuk
            </span>
            <button type="button" className="atap-navbar-cta" onClick={() => navigate("/auth")}>
              Daftar Gratis
            </button>
          </>
        )}
      </div>

    </nav>
  );
}
