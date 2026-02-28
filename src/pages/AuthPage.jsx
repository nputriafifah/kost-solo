import { useState } from "react";

function KostIllustration() {
  return (
    <svg viewBox="0 0 380 400" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", maxWidth: "320px" }}>
      {/* Sun */}
      <circle cx="190" cy="210" r="110" fill="#FFF9C4" opacity="0.85" />

      {/* Sparkles */}
      <path d="M55 95 L58 87 L61 95 L69 98 L61 101 L58 109 L55 101 L47 98 Z" fill="#FFD966" />
      <path d="M310 75 L312 69 L314 75 L320 77 L314 79 L312 85 L310 79 L304 77 Z" fill="#FFD966" />
      <path d="M328 155 L330 149 L332 155 L338 157 L332 159 L330 165 L328 159 L322 157 Z" fill="#FFD966" opacity="0.6" />
      <circle cx="75" cy="155" r="5" fill="#FFB3C6" opacity="0.7" />
      <circle cx="305" cy="130" r="4" fill="#FFB3C6" opacity="0.6" />

      {/* Far left tall building */}
      <rect x="5" y="190" width="62" height="210" rx="4" fill="#AFC6EF" />
      <rect x="5" y="172" width="62" height="22" rx="3" fill="#98B4E8" />
      <rect x="16" y="205" width="16" height="18" rx="2" fill="#5B8FD9" opacity="0.55" />
      <rect x="40" y="205" width="16" height="18" rx="2" fill="#5B8FD9" opacity="0.65" />
      <rect x="16" y="234" width="16" height="18" rx="2" fill="#5B8FD9" opacity="0.45" />
      <rect x="40" y="234" width="16" height="18" rx="2" fill="#5B8FD9" opacity="0.6" />
      <rect x="16" y="263" width="16" height="18" rx="2" fill="#5B8FD9" opacity="0.6" />
      <rect x="40" y="263" width="16" height="18" rx="2" fill="#5B8FD9" opacity="0.4" />
      <rect x="16" y="292" width="16" height="18" rx="2" fill="#5B8FD9" opacity="0.5" />
      <rect x="40" y="292" width="16" height="18" rx="2" fill="#5B8FD9" opacity="0.65" />

      {/* Far right building */}
      <rect x="313" y="210" width="67" height="190" rx="4" fill="#AFC6EF" />
      <rect x="313" y="192" width="67" height="22" rx="3" fill="#98B4E8" />
      <rect x="323" y="225" width="14" height="16" rx="2" fill="#5B8FD9" opacity="0.5" />
      <rect x="345" y="225" width="14" height="16" rx="2" fill="#5B8FD9" opacity="0.65" />
      <rect x="323" y="251" width="14" height="16" rx="2" fill="#5B8FD9" opacity="0.6" />
      <rect x="345" y="251" width="14" height="16" rx="2" fill="#5B8FD9" opacity="0.45" />
      <rect x="323" y="277" width="14" height="16" rx="2" fill="#5B8FD9" opacity="0.65" />
      <rect x="345" y="277" width="14" height="16" rx="2" fill="#5B8FD9" opacity="0.5" />

      {/* Left mid building */}
      <rect x="52" y="265" width="88" height="135" rx="4" fill="#C8DAFB" />
      <polygon points="44,265 96,220 148,265" fill="#F4AABE" />
      <rect x="65" y="280" width="22" height="22" rx="2" fill="#5B8FD9" opacity="0.5" />
      <rect x="98" y="280" width="22" height="22" rx="2" fill="#5B8FD9" opacity="0.65" />
      <rect x="65" y="312" width="22" height="22" rx="2" fill="#5B8FD9" opacity="0.4" />
      <rect x="98" y="312" width="22" height="22" rx="2" fill="#5B8FD9" opacity="0.55" />
      <rect x="78" y="355" width="26" height="45" rx="4" fill="#89B4F0" opacity="0.75" />
      <circle cx="98" cy="378" r="2.5" fill="#fff" />

      {/* Right mid building */}
      <rect x="240" y="258" width="90" height="142" rx="4" fill="#C0D4F8" />
      <polygon points="232,258 285,212 338,258" fill="#F4AABE" opacity="0.9" />
      <rect x="252" y="274" width="22" height="22" rx="2" fill="#5B8FD9" opacity="0.6" />
      <rect x="285" y="274" width="22" height="22" rx="2" fill="#5B8FD9" opacity="0.45" />
      <rect x="252" y="306" width="22" height="22" rx="2" fill="#5B8FD9" opacity="0.5" />
      <rect x="285" y="306" width="22" height="22" rx="2" fill="#5B8FD9" opacity="0.65" />
      <rect x="263" y="348" width="28" height="52" rx="4" fill="#89B4F0" opacity="0.7" />
      <circle cx="285" cy="374" r="2.5" fill="#fff" />

      {/* Center main building */}
      <rect x="122" y="232" width="136" height="168" rx="5" fill="#DAEAFF" />
      <polygon points="112,232 190,178 268,232" fill="#F4AABE" />
      {/* Center windows */}
      <rect x="135" y="250" width="28" height="28" rx="3" fill="#5B8FD9" opacity="0.55" />
      <rect x="176" y="250" width="28" height="28" rx="3" fill="#fff" opacity="0.9" />
      <rect x="217" y="250" width="28" height="28" rx="3" fill="#5B8FD9" opacity="0.5" />
      <rect x="135" y="293" width="28" height="28" rx="3" fill="#5B8FD9" opacity="0.45" />
      <rect x="217" y="293" width="28" height="28" rx="3" fill="#5B8FD9" opacity="0.6" />
      {/* Center door */}
      <rect x="172" y="330" width="36" height="70" rx="5" fill="#89B4F0" opacity="0.8" />
      <circle cx="202" cy="366" r="3" fill="#fff" />

      {/* Ground */}
      <ellipse cx="190" cy="400" rx="185" ry="10" fill="#B8D0F0" opacity="0.4" />

      {/* Tree left */}
      <rect x="24" y="355" width="6" height="25" rx="2" fill="#A0B8E0" />
      <ellipse cx="27" cy="348" rx="14" ry="16" fill="#8EC8A0" opacity="0.75" />
      {/* Tree right */}
      <rect x="348" y="350" width="6" height="25" rx="2" fill="#A0B8E0" />
      <ellipse cx="351" cy="343" rx="14" ry="16" fill="#8EC8A0" opacity="0.75" />
    </svg>
  );
}

const ROLE_TABS = ["Pencari Kost", "Pemilik Kost"];
const FORM_TABS = ["Masuk", "Daftar"];

export default function KostAuth() {
  const [role, setRole] = useState(0);
  const [form, setForm] = useState(0);
  const [agreed, setAgreed] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [loginData, setLoginData] = useState({ contact: "", password: "" });
  const [registerData, setRegisterData] = useState({ fullname: "", email: "", phone: "", password: "" });

  const handleLoginChange = (e) => setLoginData({ ...loginData, [e.target.name]: e.target.value });
  const handleRegisterChange = (e) => setRegisterData({ ...registerData, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 2500);
  };

  const roleLabel = role === 0 ? "Pencari Kost" : "Pemilik Kost";

  return (
    <div style={{
      minHeight: "100vh",
      background: "#EEF5FF",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "20px",
      fontFamily: "'Nunito', 'Segoe UI', sans-serif",
    }}>
      <div style={{
        display: "flex",
        width: "100%",
        maxWidth: "900px",
        minHeight: "580px",
        borderRadius: "28px",
        overflow: "hidden",
        boxShadow: "0 20px 60px rgba(91, 143, 217, 0.2)",
      }}>

        {/* LEFT PANEL - Illustration */}
        <div style={{
          flex: "0 0 42%",
          background: "linear-gradient(160deg, #D6E8FF 0%, #C0D8FA 50%, #B8CEFF 100%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "36px 24px",
          position: "relative",
          overflow: "hidden",
        }}>
          {/* Soft blob decorations */}
          <div style={{
            position: "absolute", top: "-40px", left: "-40px",
            width: "180px", height: "180px", borderRadius: "50%",
            background: "rgba(255,255,255,0.25)",
          }} />
          <div style={{
            position: "absolute", bottom: "-30px", right: "-30px",
            width: "140px", height: "140px", borderRadius: "50%",
            background: "rgba(255,255,255,0.2)",
          }} />

          <div style={{ position: "relative", zIndex: 1, width: "100%", display: "flex", justifyContent: "center", marginBottom: "16px" }}>
            <KostIllustration />
          </div>

          <div style={{ position: "relative", zIndex: 1, textAlign: "center" }}>
            <h2 style={{ margin: "0 0 6px", fontSize: "20px", fontWeight: "800", color: "#2B5BA8", letterSpacing: "-0.3px" }}>
              🏠 KostKita
            </h2>
            <p style={{ margin: 0, fontSize: "13px", color: "#5B8FD9", fontWeight: "600", lineHeight: "1.5" }}>
              Platform kost terpercaya<br />se-Indonesia
            </p>
          </div>
        </div>

        {/* RIGHT PANEL - Form */}
        <div style={{
          flex: 1,
          background: "#fff",
          padding: "36px 40px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          overflowY: "auto",
        }}>

          {/* Role Selector */}
          <div style={{
            display: "flex",
            background: "#EEF5FF",
            borderRadius: "12px",
            padding: "4px",
            marginBottom: "22px",
            gap: "4px",
          }}>
            {ROLE_TABS.map((tab, i) => (
              <button key={tab} onClick={() => { setRole(i); setForm(0); setAgreed(false); }}
                style={{
                  flex: 1, padding: "9px 0", borderRadius: "9px", border: "none",
                  cursor: "pointer", fontWeight: "700", fontSize: "12.5px", fontFamily: "inherit",
                  transition: "all 0.2s",
                  background: role === i ? "#fff" : "transparent",
                  color: role === i ? "#2B5BA8" : "#8AACD4",
                  boxShadow: role === i ? "0 2px 10px rgba(43,91,168,0.15)" : "none",
                }}>
                {i === 0 ? "🔍" : "🏘️"} {tab}
              </button>
            ))}
          </div>

          {/* Title */}
          <h1 style={{ margin: "0 0 4px", fontSize: "26px", fontWeight: "800", color: "#1A3A6E", letterSpacing: "-0.5px" }}>
            {form === 0 ? "Masuk" : "Buat Akun"}
          </h1>
          <p style={{ margin: "0 0 20px", fontSize: "13px", color: "#8AACD4" }}>
            {form === 0
              ? `Masuk sebagai ${roleLabel}`
              : `Daftar sebagai ${roleLabel}`}
          </p>

          {/* Form Tabs */}
          <div style={{ display: "flex", borderBottom: "2px solid #EEF5FF", marginBottom: "22px", gap: 0 }}>
            {FORM_TABS.map((tab, i) => (
              <button key={tab} onClick={() => { setForm(i); setAgreed(false); }}
                style={{
                  flex: 1, padding: "9px 0", border: "none", background: "none",
                  cursor: "pointer", fontWeight: "700", fontSize: "13.5px", fontFamily: "inherit",
                  color: form === i ? "#2B5BA8" : "#A8C0DC",
                  borderBottom: form === i ? "2.5px solid #4A8EE0" : "2.5px solid transparent",
                  marginBottom: "-2px", transition: "all 0.2s",
                }}>
                {tab}
              </button>
            ))}
          </div>

          {/* Success Toast */}
          {submitted && (
            <div style={{
              background: "#F0FBF4", border: "1.5px solid #7DD3A8", borderRadius: "10px",
              padding: "10px 14px", marginBottom: "14px", color: "#2D6A4F",
              fontSize: "13px", fontWeight: "700", display: "flex", alignItems: "center", gap: "8px",
            }}>
              ✅ {form === 0 ? "Berhasil masuk!" : "Akun berhasil dibuat!"}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {form === 0 ? (
              <>
                {/* LOGIN */}
                <label style={labelStyle}>Email / No. Handphone</label>
                <input name="contact" value={loginData.contact} onChange={handleLoginChange}
                  placeholder="contoh@email.com atau 08xxxxxxxxxx" required style={inputStyle}
                  onFocus={e => { e.target.style.borderColor = "#4A8EE0"; e.target.style.background = "#F5F9FF"; }}
                  onBlur={e => { e.target.style.borderColor = "#D6E8FF"; e.target.style.background = "#F8FBFF"; }} />

                <label style={labelStyle}>Password</label>
                <div style={{ position: "relative", marginBottom: "8px" }}>
                  <input name="password" type={showPass ? "text" : "password"} value={loginData.password}
                    onChange={handleLoginChange} placeholder="Masukkan password" required
                    style={{ ...inputStyle, marginBottom: 0, paddingRight: "44px" }}
                    onFocus={e => { e.target.style.borderColor = "#4A8EE0"; e.target.style.background = "#F5F9FF"; }}
                    onBlur={e => { e.target.style.borderColor = "#D6E8FF"; e.target.style.background = "#F8FBFF"; }} />
                  <button type="button" onClick={() => setShowPass(!showPass)} style={eyeBtnStyle}>
                    {showPass ? "🙈" : "👁️"}
                  </button>
                </div>

                <div style={{ textAlign: "right", marginBottom: "20px" }}>
                  <a href="#" style={{ fontSize: "12px", color: "#4A8EE0", fontWeight: "700", textDecoration: "none" }}>
                    Lupa password?
                  </a>
                </div>

                <button type="submit" style={submitBtnStyle}>Masuk</button>

                <Divider />
                <SocialButtons />

                <p style={switchTextStyle}>
                  Belum punya akun?{" "}
                  <span onClick={() => setForm(1)} style={linkStyle}>Daftar sekarang</span>
                </p>
              </>
            ) : (
              <>
                {/* REGISTER */}
                <label style={labelStyle}>Nama Lengkap</label>
                <input name="fullname" value={registerData.fullname} onChange={handleRegisterChange}
                  placeholder="Masukkan nama lengkap" required style={inputStyle}
                  onFocus={e => { e.target.style.borderColor = "#4A8EE0"; e.target.style.background = "#F5F9FF"; }}
                  onBlur={e => { e.target.style.borderColor = "#D6E8FF"; e.target.style.background = "#F8FBFF"; }} />

                <div style={{ display: "flex", gap: "12px" }}>
                  <div style={{ flex: 1 }}>
                    <label style={labelStyle}>Email</label>
                    <input name="email" type="email" value={registerData.email} onChange={handleRegisterChange}
                      placeholder="contoh@email.com" required style={inputStyle}
                      onFocus={e => { e.target.style.borderColor = "#4A8EE0"; e.target.style.background = "#F5F9FF"; }}
                      onBlur={e => { e.target.style.borderColor = "#D6E8FF"; e.target.style.background = "#F8FBFF"; }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={labelStyle}>No. HP</label>
                    <input name="phone" type="tel" value={registerData.phone} onChange={handleRegisterChange}
                      placeholder="08xxxxxxxxxx" required style={inputStyle}
                      onFocus={e => { e.target.style.borderColor = "#4A8EE0"; e.target.style.background = "#F5F9FF"; }}
                      onBlur={e => { e.target.style.borderColor = "#D6E8FF"; e.target.style.background = "#F8FBFF"; }} />
                  </div>
                </div>

                <label style={labelStyle}>Password</label>
                <div style={{ position: "relative", marginBottom: "14px" }}>
                  <input name="password" type={showPass ? "text" : "password"} value={registerData.password}
                    onChange={handleRegisterChange} placeholder="Minimal 8 karakter" required
                    style={{ ...inputStyle, marginBottom: 0, paddingRight: "44px" }}
                    onFocus={e => { e.target.style.borderColor = "#4A8EE0"; e.target.style.background = "#F5F9FF"; }}
                    onBlur={e => { e.target.style.borderColor = "#D6E8FF"; e.target.style.background = "#F8FBFF"; }} />
                  <button type="button" onClick={() => setShowPass(!showPass)} style={eyeBtnStyle}>
                    {showPass ? "🙈" : "👁️"}
                  </button>
                </div>

                {/* Agreement */}
                <div onClick={() => setAgreed(!agreed)} style={{
                  display: "flex", alignItems: "flex-start", gap: "10px", cursor: "pointer",
                  padding: "11px 14px", borderRadius: "10px", userSelect: "none",
                  background: agreed ? "#EEF5FF" : "#F8FBFF",
                  border: `1.5px solid ${agreed ? "#4A8EE0" : "#D6E8FF"}`,
                  marginBottom: "18px", transition: "all 0.2s",
                }}>
                  <div style={{
                    width: "20px", height: "20px", minWidth: "20px", borderRadius: "5px", marginTop: "1px",
                    border: `2px solid ${agreed ? "#4A8EE0" : "#B8D0EE"}`,
                    background: agreed ? "#4A8EE0" : "#fff",
                    display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s",
                  }}>
                    {agreed && <span style={{ color: "#fff", fontSize: "12px", fontWeight: "900", lineHeight: 1 }}>✓</span>}
                  </div>
                  <p style={{ margin: 0, fontSize: "12px", color: "#4A6FA5", lineHeight: "1.6" }}>
                    Dengan klik ini, saya menyatakan bahwa saya telah membaca dan menyetujui{" "}
                    <span onClick={e => e.stopPropagation()} style={{ color: "#4A8EE0", fontWeight: "700", cursor: "pointer" }}>
                      Syarat &amp; Ketentuan
                    </span>{" "}
                    serta{" "}
                    <span onClick={e => e.stopPropagation()} style={{ color: "#4A8EE0", fontWeight: "700", cursor: "pointer" }}>
                      Kebijakan Privasi
                    </span>{" "}
                    KostKita.
                  </p>
                </div>

                <button type="submit" disabled={!agreed} style={{
                  ...submitBtnStyle,
                  opacity: agreed ? 1 : 0.45,
                  cursor: agreed ? "pointer" : "not-allowed",
                }}>
                  Daftar Sekarang
                </button>

                <p style={switchTextStyle}>
                  Sudah punya akun?{" "}
                  <span onClick={() => setForm(0)} style={linkStyle}>Masuk di sini</span>
                </p>
              </>
            )}
          </form>

          {/* Help */}
          <p style={{ textAlign: "center", fontSize: "11.5px", color: "#A8C0DC", marginTop: "16px", marginBottom: 0 }}>
            Mengalami kendala?{" "}
            <a href="#" style={{ color: "#4A8EE0", fontWeight: "700", textDecoration: "none" }}>
              💬 Hubungi Kami
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

function Divider() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "12px", margin: "16px 0" }}>
      <div style={{ flex: 1, height: "1px", background: "#EEF5FF" }} />
      <span style={{ fontSize: "12px", color: "#A8C0DC", fontWeight: "600" }}>atau masuk dengan</span>
      <div style={{ flex: 1, height: "1px", background: "#EEF5FF" }} />
    </div>
  );
}

function SocialButtons() {
  return (
    <div style={{ display: "flex", gap: "10px", marginBottom: "16px" }}>
      <button style={{
        flex: 1, padding: "10px", borderRadius: "10px",
        border: "1.5px solid #D6E8FF", background: "#F8FBFF",
        cursor: "pointer", fontSize: "13px", fontWeight: "700",
        color: "#4A6FA5", display: "flex", alignItems: "center", justifyContent: "center",
        gap: "8px", fontFamily: "inherit", transition: "all 0.2s",
      }}>
        <svg width="18" height="18" viewBox="0 0 24 24">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
        Google
      </button>
      <button style={{
        flex: 1, padding: "10px", borderRadius: "10px",
        border: "1.5px solid #D6E8FF", background: "#F8FBFF",
        cursor: "pointer", fontSize: "13px", fontWeight: "700",
        color: "#4A6FA5", display: "flex", alignItems: "center", justifyContent: "center",
        gap: "8px", fontFamily: "inherit", transition: "all 0.2s",
      }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="#1877F2">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
        Facebook
      </button>
    </div>
  );
}

const labelStyle = {
  display: "block", fontSize: "12.5px", fontWeight: "700",
  color: "#4A6FA5", marginBottom: "5px",
};

const inputStyle = {
  width: "100%", padding: "11px 14px", borderRadius: "10px",
  border: "1.5px solid #D6E8FF", fontSize: "13.5px", fontFamily: "inherit",
  color: "#1A3A6E", background: "#F8FBFF", outline: "none",
  marginBottom: "13px", boxSizing: "border-box", transition: "border-color 0.2s, background 0.2s",
};

const eyeBtnStyle = {
  position: "absolute", right: "13px", top: "50%", transform: "translateY(-50%)",
  background: "none", border: "none", cursor: "pointer", fontSize: "15px", color: "#A8C0DC", padding: 0,
};

const submitBtnStyle = {
  width: "100%", padding: "13px", borderRadius: "12px", border: "none",
  background: "linear-gradient(135deg, #3A7ED5, #6AAFF5)",
  color: "#fff", fontWeight: "800", fontSize: "15px", fontFamily: "inherit",
  cursor: "pointer", boxShadow: "0 4px 18px rgba(74,142,224,0.35)",
  transition: "all 0.2s", letterSpacing: "0.2px",
};

const switchTextStyle = {
  textAlign: "center", marginTop: "14px", marginBottom: 0,
  fontSize: "13px", color: "#8AACD4",
};

const linkStyle = {
  color: "#4A8EE0", fontWeight: "800", cursor: "pointer",
};