import puppeteer from "puppeteer";
import fs from "node:fs";
import path from "node:path";

const baseUrl = process.argv[2];
const DIR = path.join(decodeURIComponent(path.dirname(new URL(import.meta.url).pathname)), "temporary screenshots", "careers-detail");
if (!fs.existsSync(DIR)) fs.mkdirSync(DIR, { recursive: true });

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto(new URL("/Careers", baseUrl).toString(), { waitUntil: "networkidle2", timeout: 30000 });

  // Find and click ASE Certified checkbox
  const checkboxes = await page.$$('input[type="checkbox"]');
  for (const cb of checkboxes) {
    const label = await page.evaluate(el => {
      const parent = el.closest('label') || el.parentElement;
      return parent ? parent.textContent.trim() : '';
    }, cb);
    if (label.includes('ASE Certified')) {
      await cb.click();
      console.log('Clicked ASE Certified');
      break;
    }
  }

  await new Promise(r => setTimeout(r, 1000));

  // Scroll to certifications area and screenshot
  await page.evaluate(() => {
    const el = Array.from(document.querySelectorAll('*')).find(e => e.textContent.includes('CERTIFICATIONS') && e.offsetHeight < 50);
    if (el) el.scrollIntoView({ block: 'start' });
  });
  await new Promise(r => setTimeout(r, 500));
  await page.screenshot({ path: path.join(DIR, 'certs-ase-clicked.png'), fullPage: false });

  // Also click Manufacturer Certified
  for (const cb of await page.$$('input[type="checkbox"]')) {
    const label = await page.evaluate(el => {
      const parent = el.closest('label') || el.parentElement;
      return parent ? parent.textContent.trim() : '';
    }, cb);
    if (label.includes('Manufacturer Certified')) {
      await cb.click();
      console.log('Clicked Manufacturer Certified');
      break;
    }
  }

  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(DIR, 'certs-both-clicked.png'), fullPage: false });

  // Scroll down to see any additional fields that appeared
  await page.evaluate(() => window.scrollBy(0, 300));
  await new Promise(r => setTimeout(r, 500));
  await page.screenshot({ path: path.join(DIR, 'certs-additional-fields.png'), fullPage: false });

  // Also check the services dropdown in nav
  await page.evaluate(() => window.scrollTo(0, 0));
  await new Promise(r => setTimeout(r, 300));

  // Hover over Services nav link
  const navLinks = await page.$$('nav a, header a');
  for (const link of navLinks) {
    const text = await page.evaluate(el => el.textContent.trim(), link);
    if (text.includes('Services')) {
      await link.hover();
      console.log('Hovered Services');
      break;
    }
  }
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(DIR, 'services-dropdown.png'), fullPage: false });

  await browser.close();
  console.log('Done');
})();
