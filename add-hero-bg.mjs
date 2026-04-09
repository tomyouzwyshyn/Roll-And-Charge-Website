import fs from "node:fs";
import path from "node:path";

const ROOT = decodeURIComponent(path.dirname(new URL(import.meta.url).pathname));

// Pages that need the faded vehicle hero background (all service pages + tires + ev + roadside)
const files = [
  "services/brakes/index.html",
  "services/diagnostics/index.html",
  "services/suspension/index.html",
  "services/transmission/index.html",
  "services/ac-cooling/index.html",
  "services/engine-repairs/index.html",
  "services/fleet/index.html",
  "tires/index.html",
  "electric-vehicles/index.html",
  "roadside/index.html",
  "about/index.html",
  "careers/index.html",
];

// The CSS for the faded car background overlay
const heroBgCSS = `
    /* Faded vehicle hero background */
    .hero-vehicle-bg::before {
      content: '';
      position: absolute;
      top: -20%;
      right: -5%;
      width: 70%;
      height: 140%;
      background: url('https://placehold.co/1200x800/f0f0f0/e0e0e0?text=') no-repeat center center;
      background-size: contain;
      opacity: 0.06;
      pointer-events: none;
      z-index: 0;
    }
`;

for (const relPath of files) {
  const filePath = path.join(ROOT, relPath);
  if (!fs.existsSync(filePath)) { console.log(`SKIP: ${relPath} not found`); continue; }

  let html = fs.readFileSync(filePath, "utf8");

  // Skip if already has hero-vehicle-bg
  if (html.includes("hero-vehicle-bg")) {
    console.log(`SKIP: ${relPath} already has hero bg`);
    continue;
  }

  // Add the CSS - find the right insertion point
  if (html.includes("</style>")) {
    html = html.replace("</style>", heroBgCSS + "  </style>");
  } else if (html.includes("</head>")) {
    html = html.replace("</head>", `  <style>${heroBgCSS}  </style>\n</head>`);
  }

  // Add the class to hero sections - look for patterns
  // Pattern: section with hero comment or first section after nav
  // Most pages use: <section class="bg-white pt-... or <section class="relative overflow-hidden"

  // Add hero-vehicle-bg class to the first <section after </nav>
  const navEnd = html.indexOf("</nav>");
  if (navEnd !== -1) {
    const afterNav = html.substring(navEnd);
    const sectionMatch = afterNav.match(/<section\s+class="([^"]*)"/);
    if (sectionMatch) {
      const oldClass = sectionMatch[1];
      // Only add if not already relative
      const newClass = oldClass.includes("relative")
        ? `${oldClass} hero-vehicle-bg`
        : `${oldClass} relative hero-vehicle-bg`;
      html = html.replace(`<section class="${oldClass}"`, `<section class="${newClass}"`);
    }
  }

  fs.writeFileSync(filePath, html);
  console.log(`Updated: ${relPath}`);
}

console.log("\nDone!");
