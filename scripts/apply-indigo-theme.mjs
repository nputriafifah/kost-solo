import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "../src");

const REPLACEMENTS = [
  ["#1D4ED8", "#4F46E5"],
  ["#1d4ed8", "#4F46E5"],
  ["#1E40AF", "#4338CA"],
  ["#1e40af", "#4338CA"],
  ["#1E3A8A", "#3730A3"],
  ["#1e3a8a", "#3730A3"],
  ["#2563EB", "#6366F1"],
  ["#2563eb", "#6366F1"],
  ["#3B82F6", "#818CF8"],
  ["#3b82f6", "#818CF8"],
  ["#60A5FA", "#A5B4FC"],
  ["#60a5fa", "#A5B4FC"],
  ["#93C5FD", "#C7D2FE"],
  ["#93c5fd", "#C7D2FE"],
  ["#BFDBFE", "#DDD6FE"],
  ["#bfdbfe", "#DDD6FE"],
  ["#EFF6FF", "#F5F3FF"],
  ["#eff6ff", "#F5F3FF"],
  ["#F0F9FF", "#EEF2FF"],
  ["#f0f9ff", "#EEF2FF"],
  ["#DBEAFE", "#E0E7FF"],
  ["#dbeafe", "#E0E7FF"],
  ["#F8FAFF", "#FAFAFE"],
  ["#f8faff", "#FAFAFE"],
  ["#FAFBFF", "#FAFAFE"],
  ["#fafbff", "#FAFAFE"],
  ["#0288d1", "#4F46E5"],
  ["#B2EBF2", "#E0E7FF"],
  ["#b2ebf2", "#E0E7FF"],
  ["#0F172A", "#1E1B4B"],
  ["#0f172a", "#1e1b4b"],
  ["rgba(29,78,216,", "rgba(79,70,229,"],
  ["rgba(37,99,235,", "rgba(99,102,241,"],
  ["rgba(59,130,246,", "rgba(129,140,248,"],
  ["'Plus Jakarta Sans', sans-serif", "'Outfit', sans-serif"],
  ["'Plus Jakarta Sans','Inter',sans-serif", "'Outfit','Inter',sans-serif"],
  ["'Plus Jakarta Sans', 'Inter', sans-serif", "'Outfit', 'Inter', sans-serif"],
  ["'Plus Jakarta Sans'", "'Outfit'"],
  ['"Plus Jakarta Sans"', '"Outfit"'],
  ["Plus Jakarta Sans", "Outfit"],
  ["'DM Sans', sans-serif", "'Outfit', sans-serif"],
  ["'DM Sans', -apple-system, sans-serif", "'Outfit', -apple-system, sans-serif"],
  ["font-family:'DM Sans'", "font-family:'Outfit'"],
  ["font-family: 'DM Sans'", "font-family: 'Outfit'"],
  ["DM Sans", "Outfit"],
  ["--bg-primary: #F8FAFC", "--bg-primary: #F5F3FF"],
  ["--bg-tertiary: #F1F5F9", "--bg-tertiary: #EEF2FF"],
  ["--border-color: #E2E8F0", "--border-color: #E0E7FF"],
  ["background: #F8FAFC", "background: #F5F3FF"],
  ["background:#F8FAFC", "background:#F5F3FF"],
  [
    "@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=DM+Sans:wght@300;400;500;700&display=swap');",
    "@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400..900;1,9..144,400..900&family=Outfit:wght@400;500;600;700;800&display=swap');",
  ],
  [".atap-root h1, .atap-root h2, .atap-root h3 { font-family: 'Outfit', sans-serif; }", ".atap-root h1, .atap-root h2, .atap-root h3 { font-family: 'Fraunces', Georgia, serif; }"],
  [".al-root h1, .al-root h2, .al-root h3 {\n    font-family: 'Outfit', sans-serif;\n  }", ".al-root h1, .al-root h2, .al-root h3 {\n    font-family: 'Fraunces', Georgia, serif;\n  }"],
];

const TAILWIND_MAP = [
  ["to-blue-800", "to-indigo-800"],
  ["from-blue-600", "from-indigo-600"],
  ["from-blue-500", "from-indigo-500"],
  ["from-blue-50", "from-indigo-50"],
  ["via-blue-50", "via-indigo-50"],
  ["to-blue-600", "to-indigo-600"],
  ["to-blue-500", "to-indigo-500"],
  ["to-sky-500", "to-indigo-500"],
  ["text-blue-900", "text-indigo-950"],
  ["text-blue-800", "text-indigo-800"],
  ["text-blue-700", "text-indigo-700"],
  ["text-blue-600", "text-indigo-600"],
  ["text-blue-500", "text-indigo-600"],
  ["text-blue-400", "text-indigo-400"],
  ["text-blue-300", "text-indigo-300"],
  ["text-blue-200", "text-indigo-200"],
  ["text-blue-100", "text-indigo-100"],
  ["bg-blue-900", "bg-indigo-950"],
  ["bg-blue-800", "bg-indigo-800"],
  ["bg-blue-700", "bg-indigo-700"],
  ["bg-blue-600", "bg-indigo-600"],
  ["bg-blue-500", "bg-indigo-600"],
  ["bg-blue-400", "bg-indigo-400"],
  ["bg-blue-200", "bg-indigo-200"],
  ["bg-blue-100", "bg-indigo-100"],
  ["bg-blue-50", "bg-indigo-50"],
  ["border-blue-600", "border-indigo-600"],
  ["border-blue-500", "border-indigo-500"],
  ["border-blue-400", "border-indigo-400"],
  ["border-blue-300", "border-indigo-300"],
  ["border-blue-200", "border-indigo-200"],
  ["border-blue-100", "border-indigo-100"],
  ["border-blue-50", "border-indigo-50"],
  ["hover:border-blue-100", "hover:border-indigo-100"],
  ["hover:border-blue-400", "hover:border-indigo-400"],
  ["hover:text-blue-600", "hover:text-indigo-600"],
  ["hover:bg-blue-600", "hover:bg-indigo-600"],
  ["hover:bg-blue-700", "hover:bg-indigo-700"],
  ["focus:border-blue-400", "focus:border-indigo-400"],
  ["focus:ring-blue-100", "focus:ring-indigo-100"],
  ["focus:ring-blue-50", "focus:ring-indigo-50"],
  ["shadow-blue-200", "shadow-indigo-200"],
  ["shadow-blue-100", "shadow-indigo-100"],
  ["ring-blue-500", "ring-indigo-500"],
  ["focus:ring-blue-500", "focus:ring-indigo-500"],
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
  for (const [from, to] of [...REPLACEMENTS, ...TAILWIND_MAP]) {
    text = text.split(from).join(to);
  }
  if (text !== orig) {
    fs.writeFileSync(file, text, "utf8");
    changed += 1;
    console.log("updated", path.relative(root, file));
  }
}
console.log("done,", changed, "files");
