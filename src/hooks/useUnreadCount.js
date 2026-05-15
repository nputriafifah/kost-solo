// hooks/useUnreadCount.js
// Drop-in hook: polls /chats setiap POLL_MS ms,
// returns { unreadCount } dan memunculkan toast saat ada pesan baru.

import { useState, useEffect, useRef, useCallback } from "react";

const API       = "http://localhost:8080";
const POLL_MS   = 8_000;   // polling interval (8 detik)

/**
 * @param {string|null} token  – JWT dari localStorage
 * @param {string|null} userId – ID user yang login
 * @returns {{ unreadCount: number }}
 */
export function useUnreadCount(token, userId) {
  const [unreadCount, setUnreadCount]   = useState(0);
  const prevUnreadRef                   = useRef(null);   // null = belum pernah fetch
  const timerRef                        = useRef(null);

  const fetchCount = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API}/chats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;

      const json = await res.json();
      const raw  = Array.isArray(json.data) ? json.data : [];

      const count = raw.reduce((acc, thread) => {
        const lm = thread.lastMessage;
        return acc + (lm && !lm.readAt && lm.senderId !== userId ? 1 : 0);
      }, 0);

      // Tampilkan toast hanya jika ada kenaikan dan bukan fetch pertama
      if (prevUnreadRef.current !== null && count > prevUnreadRef.current) {
        const diff = count - prevUnreadRef.current;
        showToast(diff);
      }

      prevUnreadRef.current = count;
      setUnreadCount(count);
    } catch {
      // diam-diam gagal
    }
  }, [token, userId]);

  useEffect(() => {
    fetchCount();
    timerRef.current = setInterval(fetchCount, POLL_MS);
    return () => clearInterval(timerRef.current);
  }, [fetchCount]);

  return { unreadCount };
}

/* ─── Toast renderer ─────────────────────────────────────────── */

let toastContainer = null;

function getContainer() {
  if (toastContainer && document.body.contains(toastContainer)) return toastContainer;

  toastContainer = document.createElement("div");
  Object.assign(toastContainer.style, {
    position:      "fixed",
    bottom:        "80px",
    right:         "20px",
    zIndex:        "9999",
    display:       "flex",
    flexDirection: "column",
    gap:           "8px",
    pointerEvents: "none",
  });
  document.body.appendChild(toastContainer);
  return toastContainer;
}

function showToast(count) {
  const container = getContainer();
  const el        = document.createElement("div");

  el.innerHTML = `
    <div style="display:flex;align-items:center;gap:10px;">
      <div style="
        width:34px;height:34px;border-radius:10px;flex-shrink:0;
        background:linear-gradient(135deg,#2563EB,#06B6D4);
        display:flex;align-items:center;justify-content:center;">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
      </div>
      <div>
        <div style="font-size:13px;font-weight:800;color:#0F172A;font-family:'Plus Jakarta Sans',sans-serif;line-height:1.2;">
          ${count} Pesan Baru
        </div>
        <div style="font-size:11px;color:#64748B;margin-top:2px;font-family:'Plus Jakarta Sans',sans-serif;">
          Ada pesan masuk dari calon penyewa
        </div>
      </div>
    </div>
    <button onclick="this.parentElement.remove()" style="
      position:absolute;top:8px;right:10px;
      background:none;border:none;cursor:pointer;
      color:#94A3B8;font-size:16px;line-height:1;padding:0;
    ">×</button>
  `;

  Object.assign(el.style, {
    position:     "relative",
    background:   "white",
    borderRadius: "16px",
    padding:      "14px 36px 14px 14px",
    boxShadow:    "0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(37,99,235,0.15)",
    border:       "1.5px solid #BFDBFE",
    minWidth:     "260px",
    pointerEvents:"all",
    opacity:      "0",
    transform:    "translateX(20px)",
    transition:   "opacity .25s ease, transform .25s ease",
  });

  container.appendChild(el);

  // Animate in
  requestAnimationFrame(() => {
    el.style.opacity   = "1";
    el.style.transform = "translateX(0)";
  });

  // Auto-dismiss setelah 5 detik
  setTimeout(() => {
    el.style.opacity   = "0";
    el.style.transform = "translateX(20px)";
    setTimeout(() => el.remove(), 300);
  }, 5_000);
}