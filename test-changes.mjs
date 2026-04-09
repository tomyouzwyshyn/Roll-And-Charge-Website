import puppeteer from "puppeteer";
import fs from "node:fs";
import path from "node:path";

const DIR = path.join(decodeURIComponent(path.dirname(new URL(import.meta.url).pathname)), "temporary screenshots", "verify");
if (!fs.existsSync(DIR)) fs.mkdirSync(DIR, { recursive: true });

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  // Test 1: Services dropdown on home page
  await page.goto("http://localhost:3000/", { waitUntil: "networkidle2" });
  const servicesLink = await page.$(".services-dropdown");
  if (servicesLink) {
    await servicesLink.hover();
    await new Promise(r => setTimeout(r, 500));
  }
  await page.screenshot({ path: path.join(DIR, "dropdown-home.png"), fullPage: false });
  console.log("Home dropdown captured");

  // Test 2: Services dropdown on brakes page
  await page.goto("http://localhost:3000/services/brakes/", { waitUntil: "networkidle2" });
  const sd2 = await page.$(".services-dropdown");
  if (sd2) { await sd2.hover(); await new Promise(r => setTimeout(r, 500)); }
  await page.screenshot({ path: path.join(DIR, "dropdown-brakes.png"), fullPage: false });
  console.log("Brakes dropdown captured");

  // Test 3: Careers ASE checkbox
  await page.goto("http://localhost:3000/careers/", { waitUntil: "networkidle2" });
  await page.evaluate(() => {
    const el = document.getElementById('cert-ase');
    if (el) { el.scrollIntoView({ block: 'center' }); }
  });
  await new Promise(r => setTimeout(r, 300));
  await page.screenshot({ path: path.join(DIR, "careers-before-check.png"), fullPage: false });

  // Click ASE
  await page.click("#cert-ase");
  await new Promise(r => setTimeout(r, 500));
  await page.screenshot({ path: path.join(DIR, "careers-ase-checked.png"), fullPage: false });
  console.log("ASE checked captured");

  // Click Manufacturer
  await page.click("#cert-manufacturer");
  await new Promise(r => setTimeout(r, 500));
  await page.evaluate(() => window.scrollBy(0, 200));
  await new Promise(r => setTimeout(r, 300));
  await page.screenshot({ path: path.join(DIR, "careers-both-checked.png"), fullPage: false });
  console.log("Both checked captured");

  await browser.close();
  console.log("Done");
})();
