import puppeteer from "puppeteer";
import fs from "node:fs";
import path from "node:path";

const baseUrl = process.argv[2];
const DIR = path.join(decodeURIComponent(path.dirname(new URL(import.meta.url).pathname)), "temporary screenshots", "pages");
if (!fs.existsSync(DIR)) fs.mkdirSync(DIR, { recursive: true });

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto(baseUrl, { waitUntil: "networkidle2", timeout: 60000 });

  // Get all nav links
  const links = await page.evaluate(() => {
    const anchors = document.querySelectorAll("nav a, header a");
    const results = [];
    anchors.forEach(a => {
      const href = a.getAttribute("href");
      const text = a.textContent.trim();
      if (href && text && !href.startsWith("tel:") && !href.startsWith("mailto:")) {
        results.push({ href, text });
      }
    });
    return results;
  });

  console.log("Nav links found:");
  links.forEach(l => console.log(`  ${l.text} -> ${l.href}`));

  // Also check all links on the page
  const allLinks = await page.evaluate(() => {
    const anchors = document.querySelectorAll("a[href]");
    const unique = new Set();
    anchors.forEach(a => {
      const href = a.getAttribute("href");
      if (href && !href.startsWith("tel:") && !href.startsWith("mailto:") && !href.startsWith("#") && !href.startsWith("http")) {
        unique.add(href);
      }
    });
    return [...unique];
  });

  console.log("\nAll internal links:");
  allLinks.forEach(l => console.log(`  ${l}`));

  // Navigate to each unique route and screenshot
  const visited = new Set();
  for (const href of allLinks) {
    if (visited.has(href)) continue;
    visited.add(href);

    const fullUrl = new URL(href, baseUrl).toString();
    const safeName = href.replace(/\//g, "_").replace(/^_/, "") || "home";

    try {
      await page.goto(fullUrl, { waitUntil: "networkidle2", timeout: 30000 });

      // Full page screenshot
      await page.screenshot({ path: path.join(DIR, `${safeName}-full.png`), fullPage: true });

      // Viewport screenshot (top)
      await page.screenshot({ path: path.join(DIR, `${safeName}-top.png`), fullPage: false });

      const pageHeight = await page.evaluate(() => document.body.scrollHeight);
      console.log(`Captured: ${safeName} (${pageHeight}px tall)`);
    } catch (e) {
      console.log(`Failed: ${safeName} - ${e.message}`);
    }
  }

  await browser.close();
  console.log("\nDone!");
})();
