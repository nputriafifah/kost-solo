const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export function getToken() {
  return localStorage.getItem("token");
}

export async function adminApiFetch(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
      ...options.headers,
    },
  });
  if (res.status === 401) throw new Error("UNAUTHORIZED");
  if (!res.ok) {
    const json = await res.json().catch(() => ({}));
    throw new Error(json.message || "Terjadi kesalahan server");
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
