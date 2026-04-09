import puppeteer from "puppeteer";
import fs from "node:fs";
import path from "node:path";

const DIR = path.join(decodeURIComponent(path.dirname(new URL(import.meta.url).pathname)), "temporary screenshots", "headers");
if (!fs.existsSync(DIR)) fs.mkdirSync(DIR, { recursive: true });

const pages = [
  { name: "home", path: "/" },
  { name: "tires", path: "/tires/index.html" },
  { name: "ev", path: "/electric-vehicles/index.html" },
  { name: "roadside", path: "/roadside/index.html" },
  { name: "about", path: "/about/index.html" },
  { name: "careers", path: "/careers/index.html" },
  { name: "brakes", path: "/services/brakes/index.html" },
  { name: "diagnostics", path: "/services/diagnostics/index.html" },
  { name: "suspension", path: "/services/suspension/index.html" },
  { name: "transmission", path: "/services/transmission/index.html" },
  { name: "ac", path: "/services/ac-cooling/index.html" },
  { name: "engine", path: "/services/engine-repairs/index.html" },
  { name: "fleet", path: "/services/fleet/index.html" },
];

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  for (const pg of pages) {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });
    await page.goto(`http://localhost:3000${pg.path}`, { waitUntil: "networkidle2", timeout: 15000 });
    // Clip just the nav bar area (top 80px)
    await page.screenshot({ path: path.join(DIR, `${pg.name}.png`), clip: { x: 0, y: 0, width: 1440, height: 80 } });
    await page.close();
  }
  await browser.close();
  console.log("Done");
})();
