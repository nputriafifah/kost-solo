import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "../src");

const REPLACEMENTS = [
  ["rgba(59, 130, 246", "rgba(79, 70, 229"],
  ["rgba(37, 99, 235", "rgba(79, 70, 229"],
  ["rgba(99,102,241", "rgba(79,70,229"],
  ["#6366F1", "#4F46E5"],
  [
    "linear-gradient(135deg, #1E1B4B 0%, #3730A3 45%, #4F46E5 100%)",
    "linear-gradient(135deg, #1E1B4B 0%, #4338CA 38%, #4F46E5 72%, #7C3AED 100%)",
  ],
  [
    "linear-gradient(135deg, #1E1B4B 0%, #3730A3 60%, #4F46E5 100%)",
    "linear-gradient(135deg, #1E1B4B 0%, #4338CA 50%, #4F46E5 82%, #7C3AED 100%)",
  ],
  [
    "linear-gradient(135deg, #4F46E5 0%, #3730A3 45%, #4F46E5 100%)",
    "linear-gradient(135deg, #1E1B4B 0%, #4338CA 38%, #4F46E5 72%, #7C3AED 100%)",
  ],
  [
    "linear-gradient(135deg, #4F46E5, #818CF8)",
    "linear-gradient(135deg, #4F46E5, #7C3AED)",
  ],
  [
    "linear-gradient(135deg, #4F46E5, #4F46E5)",
    "linear-gradient(135deg, #4F46E5, #7C3AED)",
  ],
  ["background: #1E293B; border: 1px solid #334155", "background: #3730A3; border: 1px solid #4F46E5"],
  ["border-top: 1px solid #1E293B", "border-top: 1px solid #3730A3"],
  [".dark-mode .atap-why-section { background: #1E293B; }", ".dark-mode .atap-why-section { background: #312E81; }"],
  ["color: #818CF8", "color: #A78BFA"],
  ["border-color: #818CF8", "border-color: #A78BFA"],
  ["#818CF8", "#A78BFA"],
  ["#1340B0", "#4338CA"],
  ["#1A56DB", "#4F46E5"],
  ["#E2E8F0", "#E0E7FF"],
  ["#F8FAFC", "#F5F3FF"],
  [",#22D3EE)", ",#7C3AED)"],
  [
    "linear-gradient(135deg, #3730A3 0%, #4F46E5 30%, #4F46E5 60%, #A78BFA 100%)",
    "linear-gradient(135deg, #1E1B4B 0%, #4338CA 35%, #4F46E5 70%, #7C3AED 100%)",
  ],
  [
    "linear-gradient(135deg,#4F46E5,#A78BFA)",
    "linear-gradient(135deg,#4F46E5,#7C3AED)",
  ],
];

function walk(dir, files = []) {
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    const st = fs.statSync(p);
    if (st.isDirectory()) walk(p, files);
    else if (/\.(jsx?|css|html)$/.test(name)) files.push(p);
  }
  return files;
}

let changed = 0;
for (const file of walk(root)) {
  let text = fs.readFileSync(file, "utf8");
  const orig = text;
  for (const [from, to] of REPLACEMENTS) {
    text = text.split(from).join(to);
  }
  if (text !== orig) {
    fs.writeFileSync(file, text, "utf8");
    changed += 1;
    console.log("updated", path.relative(root, file));
  }
}
console.log("done,", changed, "files");
