import puppeteer from "puppeteer";
import fs from "node:fs";
import path from "node:path";

const urls = [
  { url: process.argv[2], prefix: "ref" },
  { url: process.argv[3], prefix: "local" },
];

const DIR = path.join(decodeURIComponent(path.dirname(new URL(import.meta.url).pathname)), "temporary screenshots", "compare");
if (!fs.existsSync(DIR)) fs.mkdirSync(DIR, { recursive: true });

(async () => {
  const browser = await puppeteer.launch({ headless: true });

  for (const { url, prefix } of urls) {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });
    await page.goto(url, { waitUntil: "networkidle2", timeout: 60000 });

    // Take hero (top) and footer (bottom) close-ups
    await page.screenshot({ path: path.join(DIR, `${prefix}-hero.png`), fullPage: false });

    // Scroll to services
    await page.evaluate(() => window.scrollTo(0, 800));
    await new Promise(r => setTimeout(r, 400));
    await page.screenshot({ path: path.join(DIR, `${prefix}-services.png`), fullPage: false });

    console.log(`${prefix} done`);
    await page.close();
  }

  await browser.close();
})();
