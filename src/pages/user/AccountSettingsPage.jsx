import React, { useState, useEffect } from "react";
import { ArrowLeft, User, Mail, Phone, Check, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function AccountSettings() {
  const navigate = useNavigate();

  const [userData, setUserData] = useState({
    name: "",
    email: "",
    phone: "",
  });

  // Field mana yang sedang diedit
  const [editingField, setEditingField] = useState(null);
  const [editValue, setEditValue] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("user");
    if (saved) {
      const parsed = JSON.parse(saved);
      setUserData({
        name: parsed.name || "",
        email: parsed.email || "",
        phone: parsed.phone || "",
      });
    }
  }, []);

  const handleStartEdit = (field, currentValue) => {
    setEditingField(field);
    setEditValue(currentValue);
  };

  const handleSaveField = () => {
    if (!editValue.trim()) return;
    const updated = { ...userData, [editingField]: editValue.trim() };
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
    {
      key: "name",
      icon: User,
      label: "Nama lengkap",
      type: "text",
      inputMode: "text",
    },
    {
      key: "email",
      icon: Mail,
      label: "Email",
      type: "email",
      inputMode: "email",
    },
    {
      key: "phone",
      icon: Phone,
      label: "Nomor WhatsApp",
      type: "tel",
      inputMode: "tel",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50">

      {/* HEADER */}
      <div className="px-5 pt-12 pb-4 flex items-center gap-3 bg-white border-b border-slate-100">
        <button
          onClick={() => navigate(-1)}
          aria-label="Kembali"
          className="w-9 h-9 bg-slate-100 hover:bg-slate-200 rounded-xl flex items-center justify-center text-slate-600 transition-colors active:scale-95"
        >
          <ArrowLeft size={18} />
        </button>
        <h1 className="text-base font-bold text-slate-900">Pengaturan akun</h1>
      </div>

      <div className="px-4 pt-5">
        <p className="text-xs font-semibold text-slate-400 mb-3 ml-1">
          Informasi publik
        </p>

        <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden">
          {fields.map(({ key, icon: Icon, label, type, inputMode }, idx) => (
            <div
              key={key}
              className={`px-4 py-3.5 ${idx !== fields.length - 1 ? "border-b border-slate-50" : ""
                }`}
            >
              {editingField === key ? (
                // Mode edit — inline input
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Icon size={16} className="text-blue-500" />
                  </div>
                  <input
                    type={type}
                    inputMode={inputMode}
                    autoFocus
                    aria-label={`Edit ${label}`}
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSaveField();
                      if (e.key === "Escape") handleCancelEdit();
                    }}
                    className="flex-1 h-9 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                  <button
                    onClick={handleSaveField}
                    disabled={!editValue.trim()}
                    aria-label="Simpan"
                    className="w-9 h-9 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 rounded-xl flex items-center justify-center text-white transition-colors active:scale-95"
                  >
                    <Check size={15} />
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    aria-label="Batal edit"
                    className="w-9 h-9 bg-slate-100 hover:bg-slate-200 rounded-xl flex items-center justify-center text-slate-500 transition-colors active:scale-95"
                  >
                    <X size={15} />
                  </button>
                </div>
              ) : (
                // Mode display — tap untuk edit
                <button
                  onClick={() => handleStartEdit(key, userData[key])}
                  aria-label={`Edit ${label}`}
                  className="w-full flex items-center gap-3 text-left"
                >
                  <div className="w-9 h-9 bg-slate-50 rounded-xl flex items-center justify-center flex-shrink-0 border border-slate-100">
                    <Icon size={16} className="text-slate-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-slate-400 mb-0.5">{label}</p>
                    <p
                      className={`text-sm font-semibold truncate ${userData[key] ? "text-slate-800" : "text-slate-300"
                        }`}
                    >
                      {userData[key] || "Belum diatur"}
                    </p>
                  </div>
                  <span className="text-xs text-blue-500 font-semibold flex-shrink-0">
                    Ubah
                  </span>
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Info tambahan */}
        <p className="text-xs text-slate-400 mt-3 ml-1 leading-relaxed">
          Informasi ini hanya digunakan untuk keperluan akun dan tidak
          dibagikan ke pihak lain.
        </p>
      </div>
    </div>
  );
}