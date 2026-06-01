import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const mainPath = path.join(__dirname, "../src/pages/owner/EditListingPage.jsx");
const returnPath = path.join(__dirname, "../src/pages/owner/_EditListingReturn.jsx");

const main = fs.readFileSync(mainPath, "utf8");
const ret = fs.readFileSync(returnPath, "utf8").trimEnd();
const returnOnly = ret.replace(/\n}\s*$/, "");

const idx = main.indexOf("  return (");
if (idx === -1) {
  console.error("return not found");
  process.exit(1);
}

const before = main.slice(0, idx);
const updated = `${before}${returnOnly}\n}\n`;
fs.writeFileSync(mainPath, updated, "utf8");
console.log("Spliced OK");
