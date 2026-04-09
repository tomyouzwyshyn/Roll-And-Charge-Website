import puppeteer from "puppeteer";
import fs from "node:fs";
import path from "node:path";

const DIR = path.join(decodeURIComponent(path.dirname(new URL(import.meta.url).pathname)), "temporary screenshots", "b44-careers");
if (!fs.existsSync(DIR)) fs.mkdirSync(DIR, { recursive: true });

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto("https://preview-sandbox--698d0039256c3e76121217a6.base44.app/Careers?_preview_token=hnPePXWCTSn3x2eORTUgx_DGK60FsDW4O9LppqPXWtM", { waitUntil: "networkidle2", timeout: 30000 });

  // Scroll to certifications area
  await page.evaluate(() => window.scrollTo(0, 1200));
  await new Promise(r => setTimeout(r, 500));
  await page.screenshot({ path: path.join(DIR, "certs-area.png"), fullPage: false });

  // Click Manufacturer Certified
  const cbs = await page.$$("input[type=checkbox]");
  for (const cb of cbs) {
    const lbl = await page.evaluate(el => (el.closest("label") || el.parentElement)?.textContent?.trim() || "", cb);
    if (lbl.includes("Manufacturer")) { await cb.click(); console.log("Clicked Manufacturer"); break; }
  }
  await new Promise(r => setTimeout(r, 1000));
  await page.evaluate(() => window.scrollBy(0, 200));
  await new Promise(r => setTimeout(r, 500));
  await page.screenshot({ path: path.join(DIR, "mfg-expanded.png"), fullPage: false });

  // Also click ASE
  const cbs2 = await page.$$("input[type=checkbox]");
  for (const cb of cbs2) {
    const lbl = await page.evaluate(el => (el.closest("label") || el.parentElement)?.textContent?.trim() || "", cb);
    if (lbl.includes("ASE Certified") && !lbl.includes("Areas")) { await cb.click(); console.log("Clicked ASE"); break; }
  }
  await new Promise(r => setTimeout(r, 1000));
  await page.evaluate(() => window.scrollBy(0, -100));
  await new Promise(r => setTimeout(r, 300));
  await page.screenshot({ path: path.join(DIR, "ase-expanded.png"), fullPage: false });

  await page.evaluate(() => window.scrollBy(0, 400));
  await new Promise(r => setTimeout(r, 300));
  await page.screenshot({ path: path.join(DIR, "both-lower.png"), fullPage: false });

  await browser.close();
  console.log("Done");
})();
