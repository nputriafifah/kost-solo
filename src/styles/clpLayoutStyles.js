export const CLP_LAYOUT_STYLES = `
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .clp-root {
          font-family: 'Outfit', -apple-system, sans-serif;
          background: #f5f6fa;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }

        /* TOP HEADER */
        .clp-topbar {
          background: #4F46E5;
          padding: 0 32px;
          height: 64px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-shrink: 0;
          box-shadow: 0 2px 8px rgba(79,70,229,0.18);
        }

        .clp-topbar-left {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .clp-topbar-brand {
          font-size: 20px;
          font-weight: 800;
          color: white;
          letter-spacing: -0.5px;
        }

        .clp-topbar-divider {
          width: 1px;
          height: 20px;
          background: rgba(255,255,255,0.25);
        }

        .clp-topbar-title {
          font-size: 14px;
          font-weight: 600;
          color: rgba(255,255,255,0.85);
        }

        .clp-back-dashboard {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          background: rgba(255,255,255,0.12);
          border: 1px solid rgba(255,255,255,0.2);
          border-radius: 8px;
          color: white;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s;
          font-family: inherit;
        }

        .clp-back-dashboard:hover {
          background: rgba(255,255,255,0.22);
        }

        /* MAIN LAYOUT */
        .clp-body {
          display: flex;
          flex: 1;
          min-height: 0;
        }

        /* SIDEBAR */
        .clp-sidebar {
          width: 280px;
          flex-shrink: 0;
          background: white;
          border-right: 1px solid #e8eaf2;
          display: flex;
          flex-direction: column;
          padding: 32px 0;
        }

        .clp-sidebar-heading {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 1px;
          text-transform: uppercase;
          color: #94a3b8;
          padding: 0 24px;
          margin-bottom: 16px;
        }

        .clp-sidebar-steps {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 4px;
          padding: 0 12px;
        }

        .clp-sidebar-step {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 12px 14px;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.2s;
          border: 1px solid transparent;
          background: transparent;
          text-align: left;
          font-family: inherit;
          width: 100%;
        }

        .clp-sidebar-step.inactive {
          cursor: default;
          opacity: 0.45;
          pointer-events: none;
        }

        .clp-sidebar-step.done {
          background: #f0fdf4;
          border-color: #bbf7d0;
        }

        .clp-sidebar-step.done:hover {
          background: #dcfce7;
        }

        .clp-sidebar-step.active {
          background: #F5F3FF;
          border-color: #DDD6FE;
        }

        .clp-step-num {
          width: 34px;
          height: 34px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          font-size: 12px;
          font-weight: 700;
          transition: all 0.2s;
        }

        .clp-sidebar-step.todo .clp-step-num {
          background: #f1f5f9;
          color: #94a3b8;
          border: 1.5px solid #e2e8f0;
        }

        .clp-sidebar-step.done .clp-step-num {
          background: #22c55e;
          color: white;
          border: none;
        }

        .clp-sidebar-step.active .clp-step-num {
          background: #4F46E5;
          color: white;
          border: none;
          box-shadow: 0 0 0 4px rgba(79,70,229,0.15);
        }

        .clp-step-info { flex: 1; min-width: 0; }

        .clp-step-name {
          font-size: 13px;
          font-weight: 600;
          color: #1e1b4b;
          line-height: 1.2;
        }

        .clp-sidebar-step.done .clp-step-name { color: #15803d; }
        .clp-sidebar-step.active .clp-step-name { color: #4F46E5; }

        .clp-step-subdesc {
          font-size: 11px;
          color: #94a3b8;
          margin-top: 2px;
          line-height: 1.3;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .clp-sidebar-step.active .clp-step-subdesc { color: #C7D2FE; }
        .clp-sidebar-step.done .clp-step-subdesc { color: #86efac; }

        /* Progress bar in sidebar */
        .clp-sidebar-progress {
          padding: 24px 24px 0;
          margin-top: 8px;
          border-top: 1px solid #f1f5f9;
        }

        .clp-sidebar-progress-label {
          display: flex;
          justify-content: space-between;
          font-size: 11px;
          font-weight: 600;
          color: #64748b;
          margin-bottom: 8px;
        }

        .clp-sidebar-progress-bar {
          height: 4px;
          background: #e8eaf2;
          border-radius: 4px;
          overflow: hidden;
        }

        .clp-sidebar-progress-fill {
          height: 100%;
          background: #4F46E5;
          border-radius: 4px;
          transition: width 0.4s cubic-bezier(0.4,0,0.2,1);
        }

        /* MAIN CONTENT */
        .clp-content {
          flex: 1;
          overflow-y: auto;
          padding: 40px 48px;
          display: flex;
          flex-direction: column;
          gap: 0;
        }

        @media (max-width: 900px) {
          .clp-sidebar { width: 220px; }
          .clp-content { padding: 24px 20px; }
        }

        @media (max-width: 640px) {
          .clp-sidebar { display: none; }
          .clp-content { padding: 20px 16px; }
        }

        /* CONTENT HEADER */
        .clp-content-header {
          margin-bottom: 32px;
        }

        .clp-content-breadcrumb {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          color: #94a3b8;
          font-weight: 500;
          margin-bottom: 12px;
        }

        .clp-content-breadcrumb span { color: #4F46E5; font-weight: 600; }

        .clp-content-title-row {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .clp-content-icon-wrap {
          width: 48px;
          height: 48px;
          background: #F5F3FF;
          border: 1.5px solid #DDD6FE;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #4F46E5;
          flex-shrink: 0;
        }

        .clp-content-title {
          font-size: 24px;
          font-weight: 800;
          color: #1e1b4b;
          letter-spacing: -0.5px;
        }

        .clp-content-subtitle {
          font-size: 13px;
          color: #64748b;
          margin-top: 2px;
          font-weight: 500;
        }

        /* FORM CARD */
        .clp-form-card {
          background: white;
          border: 1px solid #e8eaf2;
          border-radius: 16px;
          padding: 32px;
          flex: 1;
        }

        @media (max-width: 640px) {
          .clp-form-card { padding: 20px; border-radius: 12px; }
        }

        /* FORM FIELDS */
        .clp-field {
          margin-bottom: 24px;
        }

        .clp-label {
          display: block;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.6px;
          text-transform: uppercase;
          color: #334155;
          margin-bottom: 8px;
        }

        .clp-input, .clp-textarea {
          width: 100%;
          padding: 11px 14px;
          border: 1.5px solid #e2e8f0;
          border-radius: 10px;
          font-size: 14px;
          color: #1e1b4b;
          background: #FAFAFE;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
          font-family: inherit;
          font-weight: 500;
        }

        .clp-input:focus, .clp-textarea:focus {
          border-color: #A78BFA;
          background: white;
          box-shadow: 0 0 0 3px rgba(129,140,248,0.1);
        }

        .clp-input.err, .clp-textarea.err {
          border-color: #ef4444;
          background: #fff5f5;
        }

        .clp-textarea { resize: vertical; min-height: 90px; }
        .clp-input::placeholder, .clp-textarea::placeholder { color: #cbd5e1; }

        .clp-error {
          font-size: 12px;
          color: #ef4444;
          font-weight: 600;
          margin-top: 6px;
        }

        /* CHIPS */
        .clp-chip-group {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .clp-chip {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 9px 16px;
          border: 1.5px solid #e2e8f0;
          border-radius: 8px;
          background: #FAFAFE;
          color: #475569;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.18s;
          font-family: inherit;
        }

        .clp-chip:hover { border-color: #C7D2FE; background: #EEF2FF; }

        .clp-chip.active {
          border-color: #4F46E5;
          background: #F5F3FF;
          color: #4F46E5;
        }

        .clp-chip-check {
          width: 16px;
          height: 16px;
          background: #4F46E5;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* TOGGLE ROWS */
        .clp-toggle-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .clp-toggle-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 13px 16px;
          border: 1.5px solid #e2e8f0;
          border-radius: 10px;
          background: #FAFAFE;
          cursor: pointer;
          transition: all 0.18s;
          font-family: inherit;
          color: #334155;
          font-size: 14px;
          font-weight: 500;
          text-align: left;
        }

        .clp-toggle-row:hover { border-color: #C7D2FE; background: #EEF2FF; }

        .clp-toggle-row.active {
          border-color: #4F46E5;
          background: #F5F3FF;
          color: #4F46E5;
          font-weight: 600;
        }

        .clp-toggle-check {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #4F46E5;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        /* GENDER CHIPS */
        .clp-gender-group {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
        }

        .clp-gender-btn {
          padding: 11px;
          text-align: center;
          border: 1.5px solid #e2e8f0;
          border-radius: 10px;
          background: #FAFAFE;
          color: #475569;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.18s;
          font-family: inherit;
        }

        .clp-gender-btn:hover { border-color: #C7D2FE; }
        .clp-gender-btn.active {
          border-color: #4F46E5;
          background: #F5F3FF;
          color: #4F46E5;
        }

        /* MAP */
        .clp-map-container {
          height: 320px;
          border-radius: 12px;
          overflow: hidden;
          border: 1.5px solid #e2e8f0;
        }

        .clp-coord-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 9px 14px;
          background: #F5F3FF;
          border: 1.5px solid #DDD6FE;
          border-radius: 10px;
          color: #4F46E5;
          font-size: 13px;
          font-weight: 600;
          margin-top: 12px;
        }

        /* COUNTER */
        .clp-counter-wrap {
          display: flex;
          align-items: center;
          gap: 20px;
          justify-content: center;
          padding: 40px 0;
        }

        .clp-counter-btn {
          width: 52px;
          height: 52px;
          border-radius: 12px;
          border: 1.5px solid #e2e8f0;
          background: #FAFAFE;
          color: #334155;
          font-size: 24px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: inherit;
        }

        .clp-counter-btn:hover { border-color: #4F46E5; background: #F5F3FF; color: #4F46E5; }
        .clp-counter-btn:active { transform: scale(0.95); }

        .clp-counter-input {
          width: 80px;
          text-align: center;
          font-size: 36px;
          font-weight: 800;
          color: #1e1b4b;
          border: none;
          background: transparent;
          font-family: inherit;
          outline: none;
        }

        /* UPLOAD */
        .clp-upload-zone {
          border: 2px dashed #cbd5e1;
          border-radius: 14px;
          padding: 48px 24px;
          text-align: center;
          cursor: pointer;
          transition: all 0.2s;
          background: #FAFAFE;
        }

        .clp-upload-zone:hover, .clp-upload-zone.has-files {
          border-color: #A78BFA;
          background: #F5F3FF;
        }

        .clp-upload-icon-wrap {
          width: 52px;
          height: 52px;
          margin: 0 auto 14px;
          background: #4F46E5;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }

        .clp-upload-text { font-size: 15px; font-weight: 700; color: #1e293b; }
        .clp-upload-sub { font-size: 12px; color: #94a3b8; margin-top: 6px; }

        .clp-photo-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
          gap: 12px;
          margin-top: 20px;
        }

        .clp-photo-item {
          position: relative;
          aspect-ratio: 1;
          border-radius: 10px;
          overflow: hidden;
          border: 1.5px solid #e2e8f0;
          background: #FAFAFE;
        }

        .clp-photo-item img { width: 100%; height: 100%; object-fit: cover; }

        .clp-photo-del {
          position: absolute;
          inset: 0;
          background: rgba(0,0,0,0.45);
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: opacity 0.2s;
        }

        .clp-photo-item:hover .clp-photo-del { opacity: 1; }

        .clp-photo-del button {
          width: 30px; height: 30px;
          border-radius: 8px;
          background: #ef4444;
          border: none;
          color: white;
          cursor: pointer;
          display: flex; align-items: center; justify-content: center;
        }

        /* FOOTER NAV */
        .clp-nav {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: 32px;
          gap: 12px;
        }

        .clp-nav-left {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .clp-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 12px 22px;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 700;
          border: none;
          cursor: pointer;
          transition: all 0.2s;
          font-family: inherit;
          white-space: nowrap;
        }

        .clp-btn-primary {
          background: #4F46E5;
          color: white;
          box-shadow: 0 4px 14px rgba(79,70,229,0.25);
        }

        .clp-btn-primary:hover:not(:disabled) {
          background: #4338CA;
          box-shadow: 0 6px 20px rgba(79,70,229,0.3);
          transform: translateY(-1px);
        }

        .clp-btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }

        .clp-btn-outline {
          background: white;
          color: #475569;
          border: 1.5px solid #e2e8f0;
        }

        .clp-btn-outline:hover {
          border-color: #4F46E5;
          color: #4F46E5;
          background: #F5F3FF;
        }

        .clp-btn-ghost {
          background: transparent;
          color: #94a3b8;
          padding: 12px 16px;
        }

        .clp-btn-ghost:hover { color: #475569; background: #f1f5f9; }

        /* PRICE PREFIX */
        .clp-price-wrap { position: relative; }
        .clp-price-prefix {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          font-size: 13px;
          font-weight: 700;
          color: #64748b;
          pointer-events: none;
        }
        .clp-price-input { padding-left: 42px; }

        /* STEP CONNECTOR in sidebar */
        .clp-sidebar-connector {
          width: 2px;
          height: 12px;
          background: #e8eaf2;
          margin: 2px auto;
          display: block;
        }

        .clp-sidebar-connector.done { background: #bbf7d0; }

        .clp-info-note {
          background: #EEF2FF;
          border: 1px solid #bae6fd;
          border-radius: 10px;
          padding: 12px 16px;
          font-size: 13px;
          color: #0369a1;
          font-weight: 500;
          margin-bottom: 20px;
        }
      
        .clp-edit-room-card {
          border: 1px solid #e8eaf2;
          border-radius: 14px;
          overflow: hidden;
          margin-bottom: 20px;
          background: white;
        }
        .clp-edit-room-head {
          padding: 14px 18px;
          background: #F5F3FF;
          border-bottom: 1px solid #e8eaf2;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .clp-edit-room-head-title {
          font-size: 14px;
          font-weight: 700;
          color: #4F46E5;
        }
        .clp-edit-room-head-meta {
          margin-left: auto;
          font-size: 11px;
          color: #64748b;
          font-weight: 600;
        }
        .clp-edit-room-body { padding: 16px 18px; }
        .clp-edit-room-list-item {
          padding: 14px;
          border-radius: 12px;
          border: 1.5px solid #e8eaf2;
          background: #FAFAFE;
        }
        .clp-photo-thumb-inline {
          position: relative;
          aspect-ratio: 1;
          border-radius: 10px;
          overflow: hidden;
          border: 1.5px solid #e2e8f0;
        }
        .clp-photo-thumb-inline img { width: 100%; height: 100%; object-fit: cover; }
        .clp-photo-thumb-inline .clp-photo-del-btn {
          position: absolute;
          top: 6px;
          right: 6px;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: rgba(239,68,68,0.9);
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: opacity 0.2s;
        }
        .clp-photo-thumb-inline:hover .clp-photo-del-btn { opacity: 1; }
        .clp-upload-zone.compact {
          padding: 20px 16px;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .clp-spin { animation: spin 1s linear infinite; }
        .clp-step-fade { animation: clpFade 0.25s ease; }
        @keyframes clpFade {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
`;
