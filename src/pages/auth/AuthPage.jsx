import { useState } from "react";
import AuthLayout from "../../layouts/AuthLayout";
import RoleSelector from "../../components/auth/RoleSelector";
import AuthForm from "../../components/auth/AuthForm";

export default function AuthPage() {
  const [view, setView] = useState("role");
  const [role, setRole] = useState("pencari");
  const [isLogin, setIsLogin] = useState(true);

  // STEP KHUSUS OWNER REGISTER
  const [ownerStep, setOwnerStep] = useState(1);

  const handleSelectRole = (selectedRole) => {
    setRole(selectedRole);
    setIsLogin(true);
    setView("form");
    setOwnerStep(1);
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
          ownerStep={ownerStep}
          setOwnerStep={setOwnerStep}
        />
      )}
    </AuthLayout>
  );
}