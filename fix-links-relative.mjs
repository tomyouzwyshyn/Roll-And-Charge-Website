import fs from "node:fs";
import path from "node:path";

const ROOT = decodeURIComponent(path.dirname(new URL(import.meta.url).pathname));

// Map absolute paths to relative paths based on file location
const linkMap = {
  '/': 'index.html',
  '/tires/': 'tires/index.html',
  '/electric-vehicles/': 'electric-vehicles/index.html',
  '/roadside/': 'roadside/index.html',
  '/about/': 'about/index.html',
  '/careers/': 'careers/index.html',
  '/services/brakes/': 'services/brakes/index.html',
  '/services/diagnostics/': 'services/diagnostics/index.html',
  '/services/suspension/': 'services/suspension/index.html',
  '/services/transmission/': 'services/transmission/index.html',
  '/services/ac-cooling/': 'services/ac-cooling/index.html',
  '/services/engine-repairs/': 'services/engine-repairs/index.html',
  '/services/fleet/': 'services/fleet/index.html',
  '/#booking': 'index.html#booking',
};

function findFiles(dir) {
  let results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.name === "node_modules" || entry.name === "temporary screenshots" || entry.name === ".tmp") continue;
    if (entry.isDirectory()) results = results.concat(findFiles(full));
    else if (entry.name === "index.html") results.push(full);
  }
  return results;
}

const files = findFiles(ROOT);

for (const file of files) {
  let html = fs.readFileSync(file, "utf8");
  const fileDir = path.dirname(file);
  const relFromRoot = path.relative(ROOT, fileDir); // e.g. "", "tires", "services/brakes"
  const depth = relFromRoot === "" ? 0 : relFromRoot.split(path.sep).length;
  const prefix = depth === 0 ? "" : "../".repeat(depth);

  let changed = false;
  for (const [absPath, relTarget] of Object.entries(linkMap)) {
    const fullRelPath = prefix + relTarget;
    // Replace href="/path/" with href="relative/path"
    const escaped = absPath.replace(/[.*+?^${}()|[\]\\\/]/g, '\\$&');
    const regex = new RegExp(`href="${escaped}"`, 'g');
    if (regex.test(html)) {
      html = html.replace(regex, `href="${fullRelPath}"`);
      changed = true;
    }
  }

  if (changed) {
    fs.writeFileSync(file, html);
    console.log(`Updated: ${path.relative(ROOT, file)} (depth ${depth}, prefix "${prefix}")`);
  }
}

console.log("\nDone! All links converted to relative paths.");
