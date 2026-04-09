import puppeteer from "puppeteer";
import fs from "node:fs";
import path from "node:path";

const url = process.argv[2] || "http://localhost:3000";
const label = process.argv[3] || "";

const DIR = path.join(decodeURIComponent(path.dirname(new URL(import.meta.url).pathname)), "temporary screenshots");
if (!fs.existsSync(DIR)) fs.mkdirSync(DIR, { recursive: true });

// Find next available screenshot number
const existing = fs.readdirSync(DIR).filter((f) => f.startsWith("screenshot-"));
let next = 1;
for (const f of existing) {
  const match = f.match(/^screenshot-(\d+)/);
  if (match) next = Math.max(next, parseInt(match[1], 10) + 1);
}

const suffix = label ? `-${label}` : "";
const filename = `screenshot-${next}${suffix}.png`;
const outputPath = path.join(DIR, filename);

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto(url, { waitUntil: "networkidle2", timeout: 30000 });
  await page.screenshot({ path: outputPath, fullPage: true });
  await browser.close();
  console.log(`Screenshot saved: ${outputPath}`);
})();
