const BASE_URL = "http://localhost:3000";

export const request = async (url, options = {}) => {
  const token = localStorage.getItem("token");

  try {
    const res = await fetch(BASE_URL + url, {
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      ...options,
    });

    // 🔥 AMANIN RESPONSE (INI KUNCI UTAMA)
    const text = await res.text();
    let data;

    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      data = { message: text }; // kalau bukan JSON (HTML error, dll)
    }

    // ❌ kalau response error
    if (!res.ok) {
      console.log("FULL ERROR BACKEND:", data); // debug penting
      throw new Error(data.message || "Request failed");
    }

    // ✅ return data (support berbagai format backend)
    return data.data ?? data;

  } catch (error) {
    console.error("API ERROR:", error.message);
    throw error;
  }
};