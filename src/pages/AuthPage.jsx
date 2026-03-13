import { useState } from "react";
import AuthLayout from "../components/auth/AuthLayout";
import RoleSelector from "../components/auth/RoleSelector";
import AuthForm from "../components/auth/AuthForm";

export default function AuthPage() {
  const [view, setView] = useState("role");
  const [role, setRole] = useState("pencari");
  const [isLogin, setIsLogin] = useState(true);

  const handleSelectRole = (selectedRole) => {
    setRole(selectedRole);
    setIsLogin(true);
    setView("form");
  };

  return (
    <AuthLayout>
      {view === "role" ? (
        <RoleSelector onSelectRole={handleSelectRole} />
      ) : (
        <AuthForm
          role={role}
          isLogin={isLogin}
          setIsLogin={setIsLogin}
          onBack={() => setView("role")}
        />
      )}
    </AuthLayout>
  );
}