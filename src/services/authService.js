const API_BASE_URL = "http://localhost:3000";

async function request(endpoint, options = {}) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
    },
    ...options,
  });

  // === BAGIAN YANG DIUBAH MULAI DARI SINI ===
  const text = await response.text(); // Baca response sebagai teks dulu
  let data;

  try {
    data = text ? JSON.parse(text) : {}; // Coba ubah teks jadi JSON
  } catch (err) {
    data = { message: text }; // Kalau gagal (bukan JSON), jadikan pesan error biasa
  }

  if (!response.ok) {
    throw new Error(data.message || data.error || "Request gagal. Cek koneksi backend.");
  }
  // === BAGIAN YANG DIUBAH SELESAI ===

  return data;
}

export async function registerUser(payload) {
  return request("/auth/user/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function loginUser(payload) {
  return request("/auth/user/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function loginOwner(payload) {
  return request("/auth/owner/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function loginAdmin(payload) {
  return request("/auth/admin/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function verifyOtp(payload) {
  // Ubah endpoint-nya dari /verify-otp menjadi /verify-email
  return request("/auth/user/verify-email", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function resendOtp(payload) {
  return request("/auth/user/resend-otp", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// Tambahkan ini di bagian paling bawah file authService.js
export async function resetPassword(payload) {
  return request("/auth/user/reset-password", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// Pastikan juga fungsi forgotPassword sudah ada
export async function forgotPassword(payload) {
  return request("/auth/user/forgot-password", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function registerOwner(payload) {
  return request("/auth/owner/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function requestOwnerOtp(payload) {
  return request("/auth/owner/request-otp", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}