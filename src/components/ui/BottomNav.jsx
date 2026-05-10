import React from "react";
import {
  Home,
  Map,
  MessageCircle,
  Heart,
  User,
} from "lucide-react";

import {
  useNavigate,
  useLocation,
} from "react-router-dom";

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  const user = JSON.parse(localStorage.getItem("user") || "null");
  const isLoggedIn = !!user;

  // MENU GUEST
  const guestNavItems = [
    {
      icon: Home,
      label: "Home",
      path: "/",
    },
    {
      icon: User,
      label: "Masuk",
      path: "/auth",
    },
  ];

  // MENU USER LOGIN
  const userNavItems = [
    {
      icon: Home,
      label: "Home",
      path: "/",
    },
    {
      icon: Map,
      label: "Peta",
      path: "/map",
    },
    {
      icon: MessageCircle,
      label: "Pesan",
      path: "/chat",
    },
    {
      icon: Heart,
      label: "Like",
      path: "/like",
    },
    {
      icon: User,
      label: "Profil",
      path: "/profil",
    },
  ];

  const navItems = isLoggedIn
    ? userNavItems
    : guestNavItems;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-100 px-4 py-2 flex justify-around items-center shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">

      {navItems.map(({ icon: Icon, label, path }) => {
        const isActive = location.pathname === path;

        return (
          <button
            key={path}
            onClick={() => navigate(path)}
            className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-2xl transition-all active:scale-95 ${
              isActive
                ? "text-indigo-600"
                : "text-slate-400"
            }`}
          >
            <Icon
              size={22}
              className={
                isActive
                  ? "stroke-indigo-600"
                  : "stroke-slate-400"
              }
              fill={
                isActive && label === "Like"
                  ? "currentColor"
                  : "none"
              }
            />

            <span
              className={`text-[10px] font-semibold ${
                isActive
                  ? "text-indigo-600"
                  : "text-slate-400"
              }`}
            >
              {label}
            </span>

            {isActive && (
              <span className="w-1 h-1 rounded-full bg-indigo-600 mt-0.5" />
            )}
          </button>
        );
      })}
    </div>
  );
}