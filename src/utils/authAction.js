import {
  registerUser,
  loginUser,
  registerOwner,
} from "../services/authService";

// ================= GET ACTION =================
export function getAuthAction(role, isLogin) {
  // ===== PENCARI =====
  if (role === "pencari") {
    return isLogin ? loginUser : registerUser;
  }

  // ===== PEMILIK =====
  if (role === "pemilik") {
    if (!isLogin) return registerOwner;

    // 🔥 LOGIN PEMILIK → OTP (tidak lewat sini)
    return async () => ({});
  }

  throw new Error("Role tidak valid");
}

// ================= HANDLE SUBMIT (OPTIONAL) =================
export async function handleAuthSubmission(role, isLogin, payload) {
  try {
    const apiFunc = getAuthAction(role, isLogin);
    const response = await apiFunc(payload);

    // ===== TOKEN =====
    const token =
      response?.token ||
      response?.accessToken ||
      response?.data?.token;

    if (token) {
      localStorage.setItem("token", token);
    }

    // ===== USER =====
    const userData =
      response?.user ||
      response?.data?.user ||
      response;

    if (userData) {
      localStorage.setItem("user", JSON.stringify(userData));
    }

    return {
      success: true,
      data: response,
    };
  } catch (error) {
    console.error("Auth Error:", error.message);

    return {
      success: false,
      message: error.message || "Terjadi kesalahan",
    };
  }
}