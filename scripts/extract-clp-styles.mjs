import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const createPath = path.join(__dirname, "../src/pages/owner/CreateListingPage.jsx");
const outPath = path.join(__dirname, "../src/styles/clpLayoutStyles.js");

const content = fs.readFileSync(createPath, "utf8");
const start = content.indexOf("<style>{`");
const end = content.indexOf("`}</style>", start);
if (start === -1 || end === -1) {
  console.error("Could not find style block");
  process.exit(1);
}

const css = content.slice(start + "<style>{`".length, end);
const extra = `
        .clp-edit-room-card {
          border: 1px solid #e8eaf2;
          border-radius: 14px;
          overflow: hidden;
          margin-bottom: 20px;
          background: white;
        }
        .clp-edit-room-head {
          padding: 14px 18px;
          background: #eff6ff;
          border-bottom: 1px solid #e8eaf2;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .clp-edit-room-head-title {
          font-size: 14px;
          font-weight: 700;
          color: #1d4ed8;
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
          background: #fafbff;
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
`;

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(
  outPath,
  `export const CLP_LAYOUT_STYLES = \`${css}${extra}\`;\n`,
  "utf8"
);
console.log("Wrote", outPath, "bytes", css.length + extra.length);
