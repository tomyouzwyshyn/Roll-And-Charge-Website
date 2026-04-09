import puppeteer from "puppeteer";
import fs from "node:fs";
import path from "node:path";

const BASE = "http://localhost:3000";
const DIR = path.join(decodeURIComponent(path.dirname(new URL(import.meta.url).pathname)), "temporary screenshots", "site-check");
if (!fs.existsSync(DIR)) fs.mkdirSync(DIR, { recursive: true });

const pages = [
  { name: "home", path: "/" },
  { name: "tires", path: "/tires/" },
  { name: "electric-vehicles", path: "/electric-vehicles/" },
  { name: "roadside", path: "/roadside/" },
  { name: "about", path: "/about/" },
  { name: "careers", path: "/careers/" },
  { name: "brakes", path: "/services/brakes/" },
  { name: "diagnostics", path: "/services/diagnostics/" },
  { name: "suspension", path: "/services/suspension/" },
  { name: "transmission", path: "/services/transmission/" },
  { name: "ac-cooling", path: "/services/ac-cooling/" },
  { name: "engine-repairs", path: "/services/engine-repairs/" },
  { name: "fleet", path: "/services/fleet/" },
];

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const results = [];

  for (const pg of pages) {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });

    const errors = [];
    const consoleMsgs = [];
    page.on("pageerror", (e) => errors.push(e.message));
    page.on("console", (msg) => { if (msg.type() === "error") consoleMsgs.push(msg.text()); });

    try {
      const resp = await page.goto(`${BASE}${pg.path}`, { waitUntil: "networkidle2", timeout: 15000 });
      const status = resp.status();

      // Check page has content
      const title = await page.title();
      const h1 = await page.evaluate(() => {
        const el = document.querySelector("h1");
        return el ? el.textContent.trim().substring(0, 60) : "NO H1 FOUND";
      });

      // Check nav links
      const navLinks = await page.evaluate(() => {
        const links = document.querySelectorAll("nav a");
        return Array.from(links).map(a => ({ text: a.textContent.trim(), href: a.getAttribute("href") }));
      });

      // Check footer exists
      const hasFooter = await page.evaluate(() => !!document.querySelector("footer"));

      // Check for broken images
      const brokenImages = await page.evaluate(() => {
        const imgs = document.querySelectorAll("img");
        return Array.from(imgs).filter(img => !img.complete || img.naturalWidth === 0).map(img => img.src);
      });

      // Check all internal links on the page
      const allLinks = await page.evaluate(() => {
        const anchors = document.querySelectorAll("a[href]");
        const internal = [];
        anchors.forEach(a => {
          const href = a.getAttribute("href");
          if (href && href.startsWith("/") && !href.startsWith("//")) {
            internal.push(href);
          }
        });
        return [...new Set(internal)];
      });

      // Screenshot
      await page.screenshot({ path: path.join(DIR, `${pg.name}.png`), fullPage: false });

      results.push({
        name: pg.name,
        status,
        title,
        h1,
        navLinkCount: navLinks.length,
        hasFooter,
        brokenImages: brokenImages.length,
        internalLinks: allLinks.length,
        jsErrors: errors.length,
        consoleErrors: consoleMsgs.length,
        ok: status === 200 && hasFooter && h1 !== "NO H1 FOUND"
      });

    } catch (e) {
      results.push({ name: pg.name, status: "FAIL", error: e.message, ok: false });
    }
    await page.close();
  }

  // Now test all internal links found across the site
  const allInternalLinks = new Set();
  const page2 = await browser.newPage();
  for (const pg of pages) {
    await page2.goto(`${BASE}${pg.path}`, { waitUntil: "networkidle2", timeout: 10000 });
    const links = await page2.evaluate(() => {
      const anchors = document.querySelectorAll("a[href]");
      const internal = [];
      anchors.forEach(a => {
        const href = a.getAttribute("href");
        if (href && href.startsWith("/") && !href.startsWith("//") && !href.includes("#")) {
          internal.push(href);
        }
      });
      return [...new Set(internal)];
    });
    links.forEach(l => allInternalLinks.add(l));
  }
  await page2.close();

  console.log("\n=== PAGE STATUS ===");
  for (const r of results) {
    const icon = r.ok ? "OK" : "FAIL";
    console.log(`[${icon}] ${r.name.padEnd(20)} HTTP ${r.status} | H1: ${r.h1 || "?"} | Nav: ${r.navLinkCount} links | Footer: ${r.hasFooter ? "yes" : "NO"} | Broken imgs: ${r.brokenImages} | JS errors: ${r.jsErrors}`);
  }

  console.log("\n=== LINK CHECK ===");
  const broken = [];
  for (const link of allInternalLinks) {
    try {
      const resp = await (await browser.newPage()).goto(`${BASE}${link}`, { waitUntil: "domcontentloaded", timeout: 5000 });
      const s = resp.status();
      if (s !== 200) {
        broken.push({ link, status: s });
        console.log(`[BROKEN] ${link} -> ${s}`);
      }
    } catch (e) {
      broken.push({ link, error: e.message });
      console.log(`[BROKEN] ${link} -> ${e.message}`);
    }
  }
  if (broken.length === 0) console.log("All internal links resolve (200 OK)");

  console.log(`\n=== SUMMARY ===`);
  console.log(`Pages: ${results.filter(r => r.ok).length}/${results.length} OK`);
  console.log(`Broken links: ${broken.length}`);
  console.log(`Total unique internal links tested: ${allInternalLinks.size}`);

  await browser.close();
})();
