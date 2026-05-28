import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children, role }) {
  const token = localStorage.getItem("token");

  let user = null;

  try {
    const rawUser = localStorage.getItem("user");
    user = rawUser ? JSON.parse(rawUser) : null;
  } catch (error) {
    console.error("User parse error:", error);
    return <Navigate to="/auth" replace />;
  }

  // ❗ kalau belum login
  if (!token || !user) {
    return <Navigate to="/auth" replace />;
  }

  const userRole = user.role?.toUpperCase();
  const roleHome = {
    USER: "/dashboard",
    OWNER: "/owner/dashboard",
    ADMIN: "/admin/dashboard",
  };

  // mapping role UI → backend
  const roleMap = {
    pencari: "USER",
    pemilik: "OWNER",
  };

  if (role) {
    const expectedRole = roleMap[role] || role;
    if (userRole !== expectedRole) {
      return <Navigate to={roleHome[userRole] || "/"} replace />;
    }
  }

  return children;
}