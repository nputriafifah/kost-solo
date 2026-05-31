import { useState, useEffect, useCallback } from "react";

import { getReactivationRequests } from "../utils/reactivationRequests";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
const READ_KEY = "atap_admin_notif_read";

function getToken() {
  return localStorage.getItem("token");
}

function getReadIds() {
  try {
    return new Set(JSON.parse(localStorage.getItem(READ_KEY) || "[]"));
  } catch {
    return new Set();
  }
}

function saveReadIds(ids) {
  localStorage.setItem(READ_KEY, JSON.stringify([...ids]));
}

async function apiFetch(path) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
  });
  if (res.status === 401) throw new Error("UNAUTHORIZED");
  if (!res.ok) {
    const json = await res.json().catch(() => ({}));
    throw new Error(json.message || "Terjadi kesalahan server");
  }
  return res.json();
}

function buildNotifications(pendingListings, pendingReports, reactivationRequests, readIds) {
  const items = [];

  for (const req of reactivationRequests) {
    const id = `reactivation-${req.listingId}`;
    items.push({
      id,
      type: "REACTIVATION_REQUEST",
      title: "Permintaan aktivasi kost",
      message: `${req.ownerName} minta aktifkan lagi "${req.listingName}".`,
      createdAt: req.requestedAt,
      readAt: readIds.has(id) ? new Date().toISOString() : null,
      listingId: req.listingId,
    });
  }

  for (const listing of pendingListings) {
    const id = `listing-${listing.id}`;
    items.push({
      id,
      type: "LISTING_PENDING",
      title: "Kost baru menunggu persetujuan",
      message: `${listing.owner?.name ?? "Pemilik"} menambahkan kost "${listing.name}" dan siap ditinjau.`,
      createdAt: listing.createdAt,
      readAt: readIds.has(id) ? new Date().toISOString() : null,
      listingId: listing.id,
    });
  }

  for (const report of pendingReports) {
    const id = `report-${report.id}`;
    const reasonLabels = {
      TIDAK_AKTIF: "Tidak aktif",
      FOTO_TIDAK_SESUAI: "Foto tidak sesuai",
      INFORMASI_SALAH: "Informasi salah",
      PENIPUAN: "Penipuan",
    };
    items.push({
      id,
      type: "REPORT_NEW",
      title: "Laporan kost baru",
      message: `Kost "${report.listing?.name ?? "-"}" dilaporkan (${reasonLabels[report.reason] ?? report.reason}).`,
      createdAt: report.createdAt,
      readAt: readIds.has(id) ? new Date().toISOString() : null,
      reportId: report.id,
    });
  }

  return items.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function useAdminNotifications({ pollMs = 30000, enabled = true } = {}) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!enabled || !getToken()) return;
    try {
      const readIds = getReadIds();
      const [pendingRes, reportsRes] = await Promise.all([
        apiFetch("/admin/listings/pending"),
        apiFetch("/admin/reports?status=PENDING&limit=50"),
      ]);

      const pendingListings = Array.isArray(pendingRes?.data)
        ? pendingRes.data
        : Array.isArray(pendingRes)
          ? pendingRes
          : [];

      const pendingReports = Array.isArray(reportsRes?.data)
        ? reportsRes.data
        : Array.isArray(reportsRes)
          ? reportsRes
          : [];

      const items = buildNotifications(
        pendingListings,
        pendingReports,
        getReactivationRequests(),
        readIds
      );
      setNotifications(items);
      setUnreadCount(items.filter((n) => !n.readAt).length);
    } catch (err) {
      if (err.message !== "UNAUTHORIZED") {
        console.error("Admin notifications:", err.message);
      }
    }
  }, [enabled]);

  const load = useCallback(async () => {
    if (!enabled || !getToken()) return;
    setLoading(true);
    try {
      await refresh();
    } finally {
      setLoading(false);
    }
  }, [enabled, refresh]);

  const markRead = useCallback(async (id) => {
    const readIds = getReadIds();
    readIds.add(id);
    saveReadIds(readIds);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, readAt: new Date().toISOString() } : n))
    );
    setUnreadCount((c) => Math.max(0, c - 1));
  }, []);

  const markAllRead = useCallback(async () => {
    const readIds = getReadIds();
    notifications.forEach((n) => readIds.add(n.id));
    saveReadIds(readIds);
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, readAt: n.readAt ?? new Date().toISOString() }))
    );
    setUnreadCount(0);
  }, [notifications]);

  useEffect(() => {
    load();
    if (!enabled || pollMs <= 0) return undefined;
    const t = setInterval(refresh, pollMs);
    return () => clearInterval(t);
  }, [load, refresh, enabled, pollMs]);

  return {
    notifications,
    unreadCount,
    loading,
    refresh,
    markRead,
    markAllRead,
  };
}
