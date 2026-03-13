import {
  registerUser,
  loginUser,
  loginOwner,
  loginAdmin,
} from "../services/authService";

/**
 * Fungsi untuk mendapatkan fungsi API berdasarkan role
 */
export function getAuthAction(role, isLogin) {
  if (role === "pencari" && !isLogin) return registerUser;
  if (role === "pencari" && isLogin) return loginUser;
  if (role === "pemilik" && isLogin) return loginOwner;
  if (role === "admin" && isLogin) return loginAdmin;

  throw new Error("Mode auth untuk role ini belum tersedia");
}

/**
 * Tambahkan fungsi helper ini untuk menangani login/register di UI (AuthPage)
 * Fungsi ini akan otomatis menyimpan data user secara lengkap.
 */
export async function handleAuthSubmission(role, isLogin, payload) {
  try {
    const apiFunc = getAuthAction(role, isLogin);
    const response = await apiFunc(payload);

    // Cek apakah response mengandung data yang kita butuhkan
    if (response) {
      // 1. Simpan Token
      if (response.token) {
        localStorage.setItem("token", response.token);
      }

      // 2. Simpan Data User secara lengkap (Object)
      // Jika backend mengirim { user: { id, fullname, ... } }
      if (response.user) {
        localStorage.setItem("user", JSON.stringify(response.user));
      } 
      // Jika backend langsung mengirim data user di root: { id, fullname, token }
      else {
        localStorage.setItem("user", JSON.stringify(response));
      }

      return { success: true, data: response };
    }
  } catch (error) {
    console.error("Auth Error:", error.message);
    return { success: false, message: error.message };
  }
}