import puppeteer from "puppeteer";
import fs from "node:fs";
import path from "node:path";

const baseUrlRef = process.argv[2]; // Base44 reference
const baseUrlLocal = process.argv[3] || "http://localhost:3000"; // Local

const DIR = path.join(decodeURIComponent(path.dirname(new URL(import.meta.url).pathname)), "temporary screenshots", "final-compare");
if (!fs.existsSync(DIR)) fs.mkdirSync(DIR, { recursive: true });

const pages = [
  { name: "home", refPath: "/Home", localPath: "/" },
  { name: "tires", refPath: "/Tires", localPath: "/tires/" },
  { name: "ev", refPath: "/ElectricVehicle", localPath: "/electric-vehicles/" },
  { name: "roadside", refPath: "/RoadsideAssistance", localPath: "/roadside/" },
  { name: "about", refPath: "/About", localPath: "/about/" },
  { name: "careers", refPath: "/Careers", localPath: "/careers/" },
  { name: "brakes", refPath: "/Brakes", localPath: "/services/brakes/" },
  { name: "diagnostics", refPath: "/Diagnostics", localPath: "/services/diagnostics/" },
  { name: "suspension", refPath: "/Suspension", localPath: "/services/suspension/" },
  { name: "transmission", refPath: "/Transmission", localPath: "/services/transmission/" },
  { name: "ac", refPath: "/AirConditioning", localPath: "/services/ac-cooling/" },
  { name: "engine", refPath: "/EngineRepairs", localPath: "/services/engine-repairs/" },
  { name: "fleet", refPath: "/FleetServices", localPath: "/services/fleet/" },
];

(async () => {
  const browser = await puppeteer.launch({ headless: true });

  for (const pg of pages) {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });

    // Local screenshot
    try {
      await page.goto(`${baseUrlLocal}${pg.localPath}`, { waitUntil: "networkidle2", timeout: 15000 });
      await page.screenshot({ path: path.join(DIR, `${pg.name}-local.png`), fullPage: false });
    } catch (e) {
      console.log(`Local ${pg.name} failed: ${e.message}`);
    }

    // Reference screenshot
    try {
      const refUrl = new URL(pg.refPath, baseUrlRef).toString();
      await page.goto(refUrl, { waitUntil: "networkidle2", timeout: 30000 });
      await page.screenshot({ path: path.join(DIR, `${pg.name}-ref.png`), fullPage: false });
    } catch (e) {
      console.log(`Ref ${pg.name} failed: ${e.message}`);
    }

    console.log(`${pg.name} done`);
    await page.close();
  }

  await browser.close();
  console.log("All comparisons complete!");
})();
