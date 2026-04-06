import {
  registerUser,
  loginUser,
  registerOwner,
  loginOwner,
  loginAdmin,
} from "../services/authService";

/**
 * Fungsi untuk mendapatkan fungsi API berdasarkan role
 */
export function getAuthAction(role, isLogin) {
  // ===== USER / PENCARI =====
  if (role === "pencari" && !isLogin) return registerUser;
  if (role === "pencari" && isLogin) return loginUser;

  // ===== OWNER / PEMILIK =====
  if (role === "pemilik" && !isLogin) return registerOwner;
  if (role === "pemilik" && isLogin) return loginOwner;

  // ===== ADMIN =====
  if (role === "admin" && isLogin) return loginAdmin;

  throw new Error("Mode auth untuk role ini belum tersedia");
}

/**
 * Helper untuk handle login/register + simpan ke localStorage
 */
export async function handleAuthSubmission(role, isLogin, payload) {
  try {
    const apiFunc = getAuthAction(role, isLogin);
    const response = await apiFunc(payload);

    if (response) {
      const token =
        response.token ||
        response.accessToken ||
        response.data?.token;

      if (token) {
        localStorage.setItem("token", token);
      }

      const userData =
        response.user ||
        response.data?.user ||
        response;

      if (userData) {
        localStorage.setItem("user", JSON.stringify(userData));
      }

      return { success: true, data: response };
    }
  } catch (error) {
    console.error("Auth Error:", error.message);
    return { success: false, message: error.message };
  }
}