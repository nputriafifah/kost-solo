import { Home, Search, Heart, User, LogIn } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useUserNavBadges } from "../../hooks/useUserNavBadges";
import { getUserMobileNavItems, isUserNavActive } from "../../constants/userNav";

const ICONS = { home: Home, search: Search, heart: Heart, user: User, login: LogIn };

export const USER_BOTTOM_NAV_CSS = `
  .user-bottom-nav { display: none; }
  @media (max-width: 768px) {
    .user-page-shell {
      padding-bottom: calc(72px + env(safe-area-inset-bottom, 0px));
    }
    .user-bottom-nav {
      display: flex;
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      z-index: 300;
      background: rgba(255, 255, 255, 0.97);
      backdrop-filter: blur(20px);
      border-top: 1px solid #E2E8F0;
      padding: 6px 4px calc(6px + env(safe-area-inset-bottom, 0px));
      justify-content: space-around;
      align-items: center;
      box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.07);
      font-family: 'DM Sans', sans-serif;
    }
    .user-bn-item {
      flex: 1;
      max-width: 88px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 3px;
      padding: 6px 4px;
      border: none;
      background: none;
      border-radius: 12px;
      cursor: pointer;
      color: #64748B;
      transition: color 0.15s;
      font-family: inherit;
    }
    .user-bn-item.active { color: #2563EB; background: #EFF6FF; }
    .user-bn-item span {
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.02em;
      line-height: 1.1;
      text-align: center;
    }
    .user-bn-item.active::after {
      content: '';
      display: block;
      width: 4px;
      height: 4px;
      background: #2563EB;
      border-radius: 50%;
      margin-top: 1px;
    }
    .user-bn-avatar-wrap { position: relative; display: inline-flex; }
    .user-bn-avatar {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background: #DBEAFE;
      color: #1D4ED8;
      font-size: 8px;
      font-weight: 800;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 2px solid #BFDBFE;
      font-family: 'DM Sans', sans-serif;
    }
    .user-bn-item.active .user-bn-avatar {
      background: #BFDBFE;
      border-color: #2563EB;
    }
    .user-bn-notif-dot {
      position: absolute;
      top: -2px;
      right: -2px;
      width: 7px;
      height: 7px;
      background: #EF4444;
      border-radius: 50%;
      border: 1.5px solid white;
    }
  }
`;

export default function UserBottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoggedIn, initials, unreadCount } = useUserNavBadges();
  const items = getUserMobileNavItems(isLoggedIn);
  const currentPath = location.pathname;

  return (
    <nav className="user-bottom-nav" aria-label="Navigasi utama">
      {items.map(({ label, path, iconKey }) => {
        const Icon = ICONS[iconKey] || Home;
        const isActive = isUserNavActive(currentPath, path);
        const isProfil = path === "/profil";

        return (
          <button
            key={path}
            type="button"
            className={`user-bn-item${isActive ? " active" : ""}`}
            onClick={() => navigate(path)}
          >
            {isProfil && isLoggedIn ? (
              <div className="user-bn-avatar-wrap">
                <div className="user-bn-avatar">{initials}</div>
                {unreadCount > 0 && <span className="user-bn-notif-dot" />}
              </div>
            ) : (
              <Icon size={20} strokeWidth={isActive ? 2.5 : 1.8} />
            )}
            <span>{label}</span>
          </button>
        );
      })}
    </nav>
  );
}
