import puppeteer from "puppeteer";
import fs from "node:fs";
import path from "node:path";

const REF = "https://preview-sandbox--698d0039256c3e76121217a6.base44.app?_preview_token=hnPePXWCTSn3x2eORTUgx_DGK60FsDW4O9LppqPXWtM";
const LOCAL = "http://localhost:3000";
const DIR = path.join(decodeURIComponent(path.dirname(new URL(import.meta.url).pathname)), "temporary screenshots", "full-compare");
if (!fs.existsSync(DIR)) fs.mkdirSync(DIR, { recursive: true });

const pages = [
  { name: "home", ref: "/Home", local: "/" },
  { name: "tires", ref: "/Tires", local: "/tires/index.html" },
  { name: "ev", ref: "/ElectricVehicle", local: "/electric-vehicles/index.html" },
  { name: "roadside", ref: "/RoadsideAssistance", local: "/roadside/index.html" },
  { name: "about", ref: "/About", local: "/about/index.html" },
  { name: "careers", ref: "/Careers", local: "/careers/index.html" },
  { name: "brakes", ref: "/Brakes", local: "/services/brakes/index.html" },
  { name: "diagnostics", ref: "/Diagnostics", local: "/services/diagnostics/index.html" },
  { name: "suspension", ref: "/Suspension", local: "/services/suspension/index.html" },
  { name: "transmission", ref: "/Transmission", local: "/services/transmission/index.html" },
  { name: "ac", ref: "/AirConditioning", local: "/services/ac-cooling/index.html" },
  { name: "engine", ref: "/EngineRepairs", local: "/services/engine-repairs/index.html" },
  { name: "fleet", ref: "/FleetServices", local: "/services/fleet/index.html" },
];

(async () => {
  const browser = await puppeteer.launch({ headless: true });

  for (const pg of pages) {
    // Reference - full page
    const p1 = await browser.newPage();
    await p1.setViewport({ width: 1440, height: 900 });
    try {
      await p1.goto(new URL(pg.ref, REF).toString(), { waitUntil: "networkidle2", timeout: 20000 });
      await p1.screenshot({ path: path.join(DIR, `${pg.name}-ref-top.png`), fullPage: false });
      // Scroll to mid
      await p1.evaluate(() => window.scrollTo(0, 900));
      await new Promise(r => setTimeout(r, 400));
      await p1.screenshot({ path: path.join(DIR, `${pg.name}-ref-mid.png`), fullPage: false });
    } catch(e) { console.log(`REF ${pg.name} failed`); }
    await p1.close();

    // Local - full page
    const p2 = await browser.newPage();
    await p2.setViewport({ width: 1440, height: 900 });
    try {
      await p2.goto(`${LOCAL}${pg.local}`, { waitUntil: "networkidle2", timeout: 10000 });
      await p2.screenshot({ path: path.join(DIR, `${pg.name}-local-top.png`), fullPage: false });
      await p2.evaluate(() => window.scrollTo(0, 900));
      await new Promise(r => setTimeout(r, 400));
      await p2.screenshot({ path: path.join(DIR, `${pg.name}-local-mid.png`), fullPage: false });
    } catch(e) { console.log(`LOCAL ${pg.name} failed`); }
    await p2.close();

    console.log(`${pg.name} done`);
  }

  await browser.close();
  console.log("All done!");
})();
