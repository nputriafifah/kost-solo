import { getApiBase } from "../../config/apiBase";

export function getToken() {
  return localStorage.getItem("token");
}

export async function adminApiFetch(path, options = {}) {
  const headers = new Headers(options.headers);
  const token = getToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const hasBody = options.body !== undefined && options.body !== null;
  const isJsonBody = typeof options.body === "string";
  if (hasBody && isJsonBody && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const res = await fetch(`${getApiBase()}${path}`, { ...options, headers });

  if (res.status === 401) throw new Error("UNAUTHORIZED");
  if (!res.ok) {
    const json = await res.json().catch(() => ({}));
    throw new Error(json.message || json.error || "Terjadi kesalahan server");
  }
  return res.json();
}

export async function adminApiFetchOptional(path) {
  try {
    return await adminApiFetch(path);
  } catch {
    return null;
  }
}

export function handleAdminAuthError(err, navigate) {
  if (err?.message === "UNAUTHORIZED") {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/auth", { replace: true });
    return true;
  }
  return false;
}
