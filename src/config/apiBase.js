/** Base URL API — dev pakai proxy Vite (/api) agar hindari CORS & salah port */
export const getApiBase = () => {
  const fromEnv = import.meta.env.VITE_API_URL?.trim();
  if (fromEnv) return fromEnv.replace(/\/$/, "");
  if (import.meta.env.DEV) return "/api";
  return "http://localhost:8080";
};

const getR2PublicBase = () => {
  const fromEnv = import.meta.env.VITE_R2_PUBLIC_URL?.trim();
  return fromEnv ? fromEnv.replace(/\/$/, "") : "";
};

/**
 * URL foto untuk <img src> — langsung ke R2.
 * null = belum ada foto di database (bukan error load).
 */
export function resolveMediaUrl(url) {
  if (!url || typeof url !== "string") return null;

  const trimmed = url.trim();
  if (!trimmed) return null;

  const r2Base = getR2PublicBase();

  if (trimmed.startsWith("https://") || trimmed.startsWith("http://")) {
    return trimmed;
  }

  if (
    trimmed.startsWith("http://localhost") ||
    trimmed.startsWith("https://localhost")
  ) {
    if (!r2Base) return null;
    try {
      const { pathname } = new URL(trimmed);
      return `${r2Base}${pathname}`;
    } catch {
      return null;
    }
  }

  if (r2Base) {
    return `${r2Base}/${trimmed.replace(/^\//, "")}`;
  }

  return null;
}

/**
 * URL file proxy backend (mis. bukti transfer) — selalu dirutekan lewat
 * origin/proxy yang sedang dipakai frontend, mengabaikan host yang "dibakar"
 * backend ke dalam URL (yang bisa salah port/origin).
 */
export function resolveFileUrl(url) {
  if (!url || typeof url !== "string") return null;

  const trimmed = url.trim();
  if (!trimmed) return null;

  const marker = "/files/";
  const idx = trimmed.indexOf(marker);
  if (idx !== -1) {
    const key = trimmed.slice(idx + marker.length).replace(/^\/+/, "");
    if (!key) return null;
    return `${getApiBase()}/files/${key}`;
  }

  return resolveMediaUrl(trimmed);
}

/** POST publik tanpa Authorization (guest / Saya Minat) */
export async function postPublicJson(path, body) {
  const headers = new Headers();
  headers.set("Content-Type", "application/json");

  const res = await fetch(`${getApiBase()}${path}`, {
    method: "POST",
    headers,
    credentials: "omit",
    mode: "cors",
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || "Request gagal");
  }
  return data;
}

/**
 * GET publik tanpa Authorization (mis. info pembayaran lead).
 */
export async function getPublicJson(path) {
  const res = await fetch(`${getApiBase()}${path}`, {
    method: "GET",
    credentials: "omit",
    mode: "cors",
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || "Request gagal");
  }
  return data;
}

/**
 * POST multipart/form-data publik (mis. upload bukti transfer lead).
 * Sertakan token jika user login agar verifikasi kepemilikan lead berjalan.
 */
export async function postPublicForm(path, formData) {
  const headers = new Headers();
  const token =
    localStorage.getItem("token") || localStorage.getItem("accessToken") || "";
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const res = await fetch(`${getApiBase()}${path}`, {
    method: "POST",
    headers,
    mode: "cors",
    body: formData,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || "Request gagal");
  }
  return data;
}
