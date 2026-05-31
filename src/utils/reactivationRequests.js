const STORAGE_KEY = "atap_reactivation_requests";

/** Antrian permintaan aktivasi owner → admin (FE-only, tanpa endpoint BE) */
export function getReactivationRequests() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const list = JSON.parse(raw || "[]");
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

export function addReactivationRequest({ listingId, listingName, ownerName }) {
  if (!listingId) return;
  const existing = getReactivationRequests();
  if (existing.some((r) => r.listingId === listingId)) return;
  const next = [
    {
      listingId,
      listingName: listingName ?? "-",
      ownerName: ownerName ?? "-",
      requestedAt: new Date().toISOString(),
    },
    ...existing,
  ];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  window.dispatchEvent(new CustomEvent("atap-reactivation-updated"));
}

export function removeReactivationRequest(listingId) {
  const next = getReactivationRequests().filter((r) => r.listingId !== listingId);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  window.dispatchEvent(new CustomEvent("atap-reactivation-updated"));
}

export function hasReactivationRequest(listingId) {
  return getReactivationRequests().some((r) => r.listingId === listingId);
}
