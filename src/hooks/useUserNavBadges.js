import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getApiBase } from "../config/apiBase";

const API = getApiBase();

function readDarkMode() {
  const theme = localStorage.getItem("atap_theme");
  if (theme) return theme === "dark";
  return localStorage.getItem("atap_dark_mode") === "true";
}

export function useUserNavBadges() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const token = localStorage.getItem("token");
  const isLoggedIn = !!user;
  const userName = user?.name || "Guest";
  const initials = isLoggedIn
    ? userName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "GU";

  const [unreadChat, setUnreadChat] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const [darkMode, setDarkMode] = useState(readDarkMode);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark-mode");
      localStorage.setItem("atap_theme", "dark");
    } else {
      document.documentElement.classList.remove("dark-mode");
      localStorage.setItem("atap_theme", "light");
    }
  }, [darkMode]);

  useEffect(() => {
    const saved = localStorage.getItem("atap_notifications");
    if (saved) {
      try {
        setUnreadCount(JSON.parse(saved).filter((n) => n.unread).length);
      } catch {
        setUnreadCount(0);
      }
    }
  }, []);

  useEffect(() => {
    if (!isLoggedIn || !token) return;

    const fetchUnreadChat = async () => {
      try {
        const res = await fetch(`${API}/chats`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) return;
        const json = await res.json();
        const raw = Array.isArray(json.data) ? json.data : [];
        setUnreadChat(
          raw.reduce((acc, thread) => {
            const lm = thread.lastMessage;
            return lm && !lm.readAt && lm.senderId !== user?.id ? acc + 1 : acc;
          }, 0)
        );
      } catch {
        /* ignore */
      }
    };

    fetchUnreadChat();
    const interval = setInterval(fetchUnreadChat, 30_000);
    return () => clearInterval(interval);
  }, [isLoggedIn, token, user?.id]);

  const doLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/auth");
  };

  return {
    user,
    token,
    isLoggedIn,
    userName,
    initials,
    unreadChat,
    unreadCount,
    darkMode,
    setDarkMode,
    doLogout,
  };
}
