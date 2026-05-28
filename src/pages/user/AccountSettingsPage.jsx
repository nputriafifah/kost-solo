import React, { useState, useEffect } from "react";
import { User, Mail, Phone, Check, X, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import UserSettingsLayout from "../../components/user/UserSettingsLayout";

function normalizeUser(parsed) {
  if (!parsed || typeof parsed !== "object") {
    return { name: "", email: "", phone: "" };
  }
  return {
    id: parsed.id,
    role: parsed.role,
    name: parsed.name || "",
    email: parsed.email || "",
    phone: parsed.phone || "",
    province: parsed.province,
    city: parsed.city,
    district: parsed.district,
    address: parsed.address,
  };
}

export default function AccountSettings() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState({ name: "", email: "", phone: "" });
  const [editingField, setEditingField] = useState(null);
  const [editValue, setEditValue] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("user");
    if (saved) {
      try {
        setUserData(normalizeUser(JSON.parse(saved)));
      } catch { /* ignore */ }
    }
  }, []);

  const handleStartEdit = (field, currentValue) => {
    setEditingField(field);
    setEditValue(currentValue);
  };

  const handleSaveField = () => {
    if (!editValue.trim()) return;
    const saved = localStorage.getItem("user");
    const base = saved ? normalizeUser(JSON.parse(saved)) : {};
    const updated = { ...base, ...userData, [editingField]: editValue.trim() };
    setUserData(updated);
    localStorage.setItem("user", JSON.stringify(updated));
    setEditingField(null);
    setEditValue("");
  };

  const handleCancelEdit = () => {
    setEditingField(null);
    setEditValue("");
  };

  const fields = [
    { key: "name", icon: User, label: "Nama lengkap", type: "text" },
    { key: "email", icon: Mail, label: "Email", type: "email" },
    { key: "phone", icon: Phone, label: "Nomor WhatsApp", type: "tel" },
  ];

  return (
    <UserSettingsLayout
      title="Pengaturan Akun"
      subtitle="Kelola nama, email, dan kontak yang dipakai untuk login dan komunikasi di Atap."
    >
      <div className="uset-grid">
        <div className="uset-card span-2">
          <h2 className="uset-card-title">Informasi akun</h2>
          <p className="uset-card-desc">
            Data disimpan di perangkat ini. Perubahan email di server belum tersedia — hubungi dukungan jika perlu mengganti email login.
          </p>

          {fields.map(({ key, icon: Icon, label, type }) => (
            <div key={key} className="uset-row">
              {editingField === key ? (
                <>
                  <div className="uset-row-icon">
                    <Icon size={18} />
                  </div>
                  <div className="uset-inline-edit">
                    <input
                      type={type}
                      className="uset-inline-input"
                      value={editValue}
                      autoFocus
                      aria-label={`Edit ${label}`}
                      onChange={(e) => setEditValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSaveField();
                        if (e.key === "Escape") handleCancelEdit();
                      }}
                    />
                    <button
                      type="button"
                      className="uset-icon-btn save"
                      disabled={!editValue.trim()}
                      onClick={handleSaveField}
                      aria-label="Simpan"
                    >
                      <Check size={16} />
                    </button>
                    <button
                      type="button"
                      className="uset-icon-btn cancel"
                      onClick={handleCancelEdit}
                      aria-label="Batal"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="uset-row-icon">
                    <Icon size={18} />
                  </div>
                  <div className="uset-row-body">
                    <p className="uset-row-label">{label}</p>
                    <p className={`uset-row-value${userData[key] ? "" : " muted"}`}>
                      {userData[key] || "Belum diatur"}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="uset-row-edit"
                    onClick={() => handleStartEdit(key, userData[key])}
                  >
                    Ubah
                  </button>
                </>
              )}
            </div>
          ))}
        </div>

        <div className="uset-card span-2">
          <h2 className="uset-card-title">Keamanan & privasi</h2>
          <p className="uset-card-desc" style={{ marginBottom: 0 }}>
            Untuk mengganti password atau mengatur privasi, buka halaman Privasi & Keamanan.
          </p>
          <button type="button" className="uset-btn-link" onClick={() => navigate("/settings/privacy")}>
            Buka Privasi & Keamanan <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </UserSettingsLayout>
  );
}
