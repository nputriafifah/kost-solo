const BASE_URL = "http://localhost:3000";

export const request = async (url, options = {}) => {
  const token = localStorage.getItem("token");

  try {
    const res = await fetch(BASE_URL + url, {
      ...options,

      headers: {
        "Content-Type": "application/json",

        ...(options.headers || {}), // 🔥 taruh dulu

        ...(token && { Authorization: `Bearer ${token}` }), // 🔥 override terakhir
      },
    });

    const text = await res.text();
    let data;

    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      data = { message: text };
    }

    if (!res.ok) {
      console.log("FULL ERROR BACKEND:", data);
      throw new Error(data.message || "Request failed");
    }

    return data.data ?? data;
  } catch (error) {
    console.error("API ERROR:", error.message);
    throw error;
  }
};