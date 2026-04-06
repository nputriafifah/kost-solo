import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children, role }) {
  const token = localStorage.getItem("token");

  const rawUser = localStorage.getItem("user");
  const user = rawUser ? JSON.parse(rawUser) : null;

  const roleMap = {
    pencari: "USER",
    pemilik: "OWNER",
  };

  if (!token || !user) {
    return <Navigate to="/auth" replace />;
  }

  if (role) {
    const expectedRole = roleMap[role] || role;

    // ✅ INI YANG DIGANTI
    if (user.role?.toUpperCase() !== expectedRole) {
      return <Navigate to="/auth" replace />;
    }
  }

  return children;
}