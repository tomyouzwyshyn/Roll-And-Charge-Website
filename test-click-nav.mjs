import puppeteer from "puppeteer";
import fs from "node:fs";
import path from "node:path";

const DIR = path.join(decodeURIComponent(path.dirname(new URL(import.meta.url).pathname)), "temporary screenshots", "click-test");
if (!fs.existsSync(DIR)) fs.mkdirSync(DIR, { recursive: true });

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  // Start at home
  await page.goto("http://localhost:3000/", { waitUntil: "networkidle2" });
  await page.screenshot({ path: path.join(DIR, "01-home.png"), fullPage: false });
  console.log("1. Home loaded:", page.url());

  // Click Tires nav link
  await page.click('a[href="/tires/"]');
  await page.waitForNavigation({ waitUntil: "networkidle2" });
  await page.screenshot({ path: path.join(DIR, "02-tires.png"), fullPage: false });
  console.log("2. Tires loaded:", page.url());

  // Click About nav link
  await page.click('a[href="/about/"]');
  await page.waitForNavigation({ waitUntil: "networkidle2" });
  await page.screenshot({ path: path.join(DIR, "03-about.png"), fullPage: false });
  console.log("3. About loaded:", page.url());

  // Hover Services dropdown, then click Brakes
  await page.hover(".services-dropdown");
  await new Promise(r => setTimeout(r, 500));
  await page.click('.dropdown-menu a[href="/services/brakes/"]');
  await page.waitForNavigation({ waitUntil: "networkidle2" });
  await page.screenshot({ path: path.join(DIR, "04-brakes.png"), fullPage: false });
  console.log("4. Brakes loaded:", page.url());

  // From Brakes, hover Services and click Fleet
  await page.hover(".services-dropdown");
  await new Promise(r => setTimeout(r, 500));
  await page.click('.dropdown-menu a[href="/services/fleet/"]');
  await page.waitForNavigation({ waitUntil: "networkidle2" });
  await page.screenshot({ path: path.join(DIR, "05-fleet.png"), fullPage: false });
  console.log("5. Fleet loaded:", page.url());

  // Click Careers
  await page.click('a[href="/careers/"]');
  await page.waitForNavigation({ waitUntil: "networkidle2" });
  await page.screenshot({ path: path.join(DIR, "06-careers.png"), fullPage: false });
  console.log("6. Careers loaded:", page.url());

  // Click Home
  const homeLink = await page.$('a[href="/"]');
  await homeLink.click();
  await page.waitForNavigation({ waitUntil: "networkidle2" });
  await page.screenshot({ path: path.join(DIR, "07-back-home.png"), fullPage: false });
  console.log("7. Back to Home:", page.url());

  // Click Electric Vehicles
  await page.click('a[href="/electric-vehicles/"]');
  await page.waitForNavigation({ waitUntil: "networkidle2" });
  await page.screenshot({ path: path.join(DIR, "08-ev.png"), fullPage: false });
  console.log("8. EV loaded:", page.url());

  // Click Roadside
  await page.click('a[href="/roadside/"]');
  await page.waitForNavigation({ waitUntil: "networkidle2" });
  await page.screenshot({ path: path.join(DIR, "09-roadside.png"), fullPage: false });
  console.log("9. Roadside loaded:", page.url());

  await browser.close();
  console.log("\nAll navigation tests passed!");
})();
