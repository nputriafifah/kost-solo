import React from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import UserNavbar, { USER_NAVBAR_CSS } from "./UserNavbar";

export const USER_SETTINGS_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=DM+Sans:wght@400;500;600&display=swap');
  * { box-sizing: border-box; }
  @keyframes spin { to { transform: rotate(360deg); } }

  .uset-root {
    min-height: 100vh;
    background: var(--bg-primary, #F1F5F9);
    font-family: 'DM Sans', sans-serif;
    color: var(--text-primary, #0F172A);
    transition: background 0.3s, color 0.3s;
  }

  .uset-hero {
    background: linear-gradient(135deg, #1D4ED8 0%, #1E40AF 55%, #312E81 100%);
    padding: 40px 48px 56px;
    position: relative; overflow: hidden;
  }
  .uset-hero::before {
    content: ''; position: absolute; top: -60px; right: -40px;
    width: 280px; height: 280px; border-radius: 50%;
    background: rgba(255,255,255,.06);
  }
  .uset-hero-inner { max-width: 1120px; margin: 0 auto; position: relative; }
  .uset-back {
    display: inline-flex; align-items: center; gap: 8px;
    background: rgba(255,255,255,.12); border: 1px solid rgba(255,255,255,.22);
    color: #fff; font-size: 14px; font-weight: 600;
    padding: 9px 16px 9px 12px; border-radius: 12px;
    cursor: pointer; margin-bottom: 20px; transition: .15s; font-family: inherit;
  }
  .uset-back:hover { background: rgba(255,255,255,.22); }
  .uset-hero h1 {
    margin: 0; font-size: 32px; font-weight: 800; color: #fff;
    font-family: 'Plus Jakarta Sans', sans-serif; letter-spacing: -.5px;
  }
  .uset-hero p { margin: 8px 0 0; font-size: 15px; color: rgba(255,255,255,.75); max-width: 560px; line-height: 1.55; }

  .uset-shell {
    max-width: 1120px; margin: -28px auto 0; padding: 0 48px 64px;
    position: relative; z-index: 2;
  }

  .uset-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
  }
  .uset-grid .span-2 { grid-column: 1 / -1; }

  .uset-card {
    background: var(--bg-secondary, #fff);
    border-radius: 20px;
    border: 1px solid var(--border-color, #E2E8F0);
    padding: 24px 28px;
    box-shadow: 0 2px 16px rgba(15,23,42,.04);
    transition: background 0.3s, border-color 0.3s;
  }
  .uset-card-title {
    font-size: 17px; font-weight: 800; margin: 0 0 4px;
    font-family: 'Plus Jakarta Sans', sans-serif;
  }
  .uset-card-desc {
    font-size: 13px; color: #64748B; margin: 0 0 20px; line-height: 1.55;
  }

  .uset-row {
    display: flex; align-items: center; gap: 16px;
    padding: 16px 0; border-bottom: 1px solid #F1F5F9;
  }
  .uset-row:last-child { border-bottom: none; padding-bottom: 0; }
  .uset-row:first-of-type { padding-top: 0; }
  .uset-row-icon {
    width: 44px; height: 44px; border-radius: 12px;
    display: flex; align-items: center; justify-content: center; flex-shrink: 0;
    background: #F8FAFC; border: 1px solid #E2E8F0; color: #64748B;
  }
  .uset-row-body { flex: 1; min-width: 0; }
  .uset-row-label { font-size: 11px; font-weight: 700; color: #94A3B8; text-transform: uppercase; letter-spacing: .06em; margin: 0 0 4px; }
  .uset-row-value { font-size: 15px; font-weight: 700; color: #0F172A; margin: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .uset-row-value.muted { color: #CBD5E1; font-weight: 600; }
  .uset-row-edit {
    font-size: 13px; font-weight: 700; color: #2563EB; background: none; border: none;
    cursor: pointer; padding: 8px 14px; border-radius: 10px; transition: .15s; font-family: inherit;
  }
  .uset-row-edit:hover { background: #EFF6FF; }

  .uset-inline-edit { display: flex; align-items: center; gap: 10px; flex: 1; min-width: 0; }
  .uset-inline-input {
    flex: 1; height: 44px; padding: 0 14px;
    border: 1.5px solid #E2E8F0; border-radius: 12px;
    font-size: 14px; font-weight: 600; color: #0F172A; outline: none;
    font-family: inherit; background: #F8FAFC;
  }
  .uset-inline-input:focus { border-color: #2563EB; background: #fff; }
  .uset-icon-btn {
    width: 40px; height: 40px; border-radius: 12px; border: none;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; transition: .15s; flex-shrink: 0;
  }
  .uset-icon-btn.save { background: #2563EB; color: #fff; }
  .uset-icon-btn.save:disabled { background: #E2E8F0; color: #94A3B8; cursor: not-allowed; }
  .uset-icon-btn.cancel { background: #F1F5F9; color: #64748B; }

  .uset-toggle {
    width: 48px; height: 28px; border-radius: 999px;
    background: #E2E8F0; border: none; cursor: pointer;
    position: relative; transition: .2s; flex-shrink: 0;
  }
  .uset-toggle.on { background: #2563EB; }
  .uset-toggle-knob {
    position: absolute; top: 3px; left: 3px;
    width: 22px; height: 22px; border-radius: 50%;
    background: #fff; box-shadow: 0 1px 4px rgba(0,0,0,.15);
    transition: transform .2s;
  }
  .uset-toggle.on .uset-toggle-knob { transform: translateX(20px); }

  .uset-btn-link {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 0; border: none; background: none;
    color: #2563EB; font-size: 13px; font-weight: 700; cursor: pointer;
    font-family: inherit; margin-top: 12px;
  }
  .uset-btn-link:hover { text-decoration: underline; }

  .uset-notif-item {
    display: flex; align-items: flex-start; gap: 14px;
    width: 100%; padding: 16px; border-radius: 14px;
    border: 1px solid #E2E8F0; background: #fff;
    cursor: pointer; text-align: left; transition: .15s;
    font-family: inherit;
  }
  .uset-notif-item:hover { border-color: #BFDBFE; background: #F8FAFC; }
  .uset-notif-item.unread { border-color: #BFDBFE; background: #F8FAFF; }
  .uset-notif-list { display: flex; flex-direction: column; gap: 10px; }
  .uset-notif-icon {
    width: 44px; height: 44px; border-radius: 12px;
    display: flex; align-items: center; justify-content: center; flex-shrink: 0;
  }
  .uset-notif-title { font-size: 14px; font-weight: 700; margin: 0; color: #0F172A; }
  .uset-notif-title.read { color: #64748B; }
  .uset-notif-desc { font-size: 13px; color: #64748B; margin: 4px 0 0; line-height: 1.45; }
  .uset-notif-time { font-size: 11px; color: #94A3B8; margin-top: 6px; }
  .uset-dot { width: 8px; height: 8px; background: #2563EB; border-radius: 50%; flex-shrink: 0; margin-top: 6px; }

  .uset-empty {
    text-align: center; padding: 48px 24px; color: #94A3B8;
  }
  .uset-empty-icon {
    width: 56px; height: 56px; margin: 0 auto 12px;
    background: #F1F5F9; border-radius: 16px;
    display: flex; align-items: center; justify-content: center;
  }

  .uset-toolbar {
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 16px; flex-wrap: wrap; gap: 12px;
  }
  .uset-toolbar-btn {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 8px 14px; border-radius: 10px; border: none;
    background: #EFF6FF; color: #1D4ED8;
    font-size: 13px; font-weight: 700; cursor: pointer; font-family: inherit;
  }
  .uset-toolbar-btn:hover { background: #DBEAFE; }

  .uset-alert {
    display: flex; gap: 10px; font-size: 13px; line-height: 1.5;
    border-radius: 12px; padding: 12px 14px; margin-bottom: 16px;
  }
  .uset-alert.ok { background: #ECFDF5; border: 1px solid #A7F3D0; color: #065F46; }
  .uset-alert.err { background: #FEF2F2; border: 1px solid #FECACA; color: #991B1B; }

  .uset-card-head {
    display: flex; align-items: flex-start; gap: 16px; margin-bottom: 20px;
  }
  .uset-card-icon-lg {
    width: 48px; height: 48px; border-radius: 14px;
    display: flex; align-items: center; justify-content: center; flex-shrink: 0;
  }
  .uset-email-chip {
    display: inline-flex; align-items: center; gap: 8px;
    margin-top: 10px; font-size: 13px; color: #475569;
    background: #F8FAFC; padding: 8px 14px; border-radius: 10px;
    border: 1px solid #E2E8F0;
  }
  .uset-btn-primary {
    display: inline-flex; align-items: center; justify-content: center; gap: 8px;
    padding: 13px 24px; border-radius: 12px; border: none; cursor: pointer;
    background: #0F172A; color: #fff; font-size: 14px; font-weight: 700;
    transition: .15s; font-family: inherit;
  }
  .uset-btn-primary:hover:not(:disabled) { background: #2563EB; }
  .uset-btn-primary:disabled { opacity: .5; cursor: not-allowed; }
  .uset-device-box {
    margin-top: 16px; padding: 16px 18px;
    background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 14px;
  }
  .uset-device-ua {
    font-size: 11px; color: #94A3B8; margin: 10px 0 0;
    word-break: break-all; line-height: 1.5;
  }
  .uset-data-list {
    margin: 0; padding-left: 20px; font-size: 14px; color: #475569; line-height: 1.7;
  }
  .uset-badge-soon {
    font-size: 10px; font-weight: 800; letter-spacing: .06em;
    text-transform: uppercase; color: #64748B;
    background: #F1F5F9; padding: 5px 10px; border-radius: 8px;
  }

  @media (max-width: 900px) {
    .uset-hero { padding: 32px 20px 48px; }
    .uset-shell { padding: 0 20px 48px; }
    .uset-grid { grid-template-columns: 1fr; }
  }
`;

export default function UserSettingsLayout({ title, subtitle, children }) {
  const navigate = useNavigate();

  return (
    <>
      <style>{USER_NAVBAR_CSS}</style>
      <style>{USER_SETTINGS_CSS}</style>
      <div className="uset-root">
        <UserNavbar />

        <div className="uset-hero">
          <div className="uset-hero-inner">
            <button type="button" className="uset-back" onClick={() => navigate("/profil")}>
              <ArrowLeft size={18} /> Kembali ke Profil
            </button>
            <h1>{title}</h1>
            {subtitle && <p>{subtitle}</p>}
          </div>
        </div>

        <div className="uset-shell">{children}</div>
      </div>
    </>
  );
}
