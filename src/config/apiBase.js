/** Base URL API — dev pakai proxy Vite (/api) agar hindari CORS & salah port */
export const getApiBase = () => {
  const fromEnv = import.meta.env.VITE_API_URL?.trim();
  if (fromEnv) return fromEnv.replace(/\/$/, "");
  if (import.meta.env.DEV) return "/api";
  return "http://localhost:3000";
};

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
