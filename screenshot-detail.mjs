import puppeteer from "puppeteer";
import fs from "node:fs";
import path from "node:path";

const baseUrl = process.argv[2];
const DIR = path.join(decodeURIComponent(path.dirname(new URL(import.meta.url).pathname)), "temporary screenshots", "detail");
if (!fs.existsSync(DIR)) fs.mkdirSync(DIR, { recursive: true });

const pages = [
  "Tires", "ElectricVehicle", "RoadsideAssistance", "About", "Careers",
  "Brakes", "Diagnostics", "Suspension", "Transmission", "AirConditioning",
  "EngineRepairs", "FleetServices"
];

(async () => {
  const browser = await puppeteer.launch({ headless: true });

  for (const pg of pages) {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });
    const url = new URL(`/${pg}`, baseUrl).toString();
    await page.goto(url, { waitUntil: "networkidle2", timeout: 30000 });

    // Section 1: Hero (top viewport)
    await page.screenshot({ path: path.join(DIR, `${pg}-1-hero.png`), fullPage: false });

    // Section 2: scroll down one viewport
    await page.evaluate(() => window.scrollTo(0, 850));
    await new Promise(r => setTimeout(r, 400));
    await page.screenshot({ path: path.join(DIR, `${pg}-2-mid.png`), fullPage: false });

    // Section 3: scroll further
    await page.evaluate(() => window.scrollTo(0, 1700));
    await new Promise(r => setTimeout(r, 400));
    await page.screenshot({ path: path.join(DIR, `${pg}-3-lower.png`), fullPage: false });

    // Section 4: scroll to bottom area
    const totalH = await page.evaluate(() => document.body.scrollHeight);
    await page.evaluate((y) => window.scrollTo(0, y), Math.max(0, totalH - 1800));
    await new Promise(r => setTimeout(r, 400));
    await page.screenshot({ path: path.join(DIR, `${pg}-4-form.png`), fullPage: false });

    console.log(`${pg} done (${totalH}px)`);
    await page.close();
  }

  await browser.close();
  console.log("All done!");
})();
