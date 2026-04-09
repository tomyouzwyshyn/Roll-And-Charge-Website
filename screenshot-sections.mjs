import puppeteer from "puppeteer";
import fs from "node:fs";
import path from "node:path";

const url = process.argv[2] || "http://localhost:3000";

const DIR = path.join(decodeURIComponent(path.dirname(new URL(import.meta.url).pathname)), "temporary screenshots");
if (!fs.existsSync(DIR)) fs.mkdirSync(DIR, { recursive: true });

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto(url, { waitUntil: "networkidle2", timeout: 60000 });

  const totalHeight = await page.evaluate(() => document.body.scrollHeight);
  const viewportH = 900;
  let section = 1;

  for (let y = 0; y < totalHeight; y += viewportH) {
    await page.evaluate((scrollY) => window.scrollTo(0, scrollY), y);
    await new Promise((r) => setTimeout(r, 500));
    const filename = `section-${section}.png`;
    await page.screenshot({ path: path.join(DIR, filename), fullPage: false });
    console.log(`Saved ${filename} (y=${y})`);
    section++;
  }

  await browser.close();
  console.log(`Done — ${section - 1} sections captured.`);
})();
