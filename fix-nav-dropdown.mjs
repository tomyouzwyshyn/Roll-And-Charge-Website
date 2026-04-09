import fs from "node:fs";
import path from "node:path";

const ROOT = decodeURIComponent(path.dirname(new URL(import.meta.url).pathname));

// The services dropdown HTML snippet
const dropdownCSS = `
    /* Services dropdown */
    .services-dropdown { position: relative; }
    .services-dropdown .dropdown-menu {
      display: none; position: absolute; top: 100%; left: 50%; transform: translateX(-50%);
      min-width: 220px; background: #fff; border: 1px solid #e5e7eb; border-radius: 12px;
      box-shadow: 0 12px 32px rgba(26,35,50,0.10); padding: 8px 0; z-index: 60; margin-top: 4px;
    }
    .services-dropdown:hover .dropdown-menu { display: block; }
    .services-dropdown .dropdown-menu a {
      display: block; padding: 8px 16px; font-size: 14px; color: #1a2332; transition: background 0.15s, color 0.15s;
    }
    .services-dropdown .dropdown-menu a:hover { background: #fef3ee; color: #e8531e; }
`;

const dropdownHTML = `<div class="services-dropdown">
          <a href="#" class="nav-link px-4 py-2 text-blue-gray font-medium text-sm flex items-center gap-1" onclick="return false;">
            Services
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"/></svg>
          </a>
          <div class="dropdown-menu">
            <a href="/services/brakes/">Brakes</a>
            <a href="/services/diagnostics/">Diagnostics</a>
            <a href="/services/suspension/">Suspension</a>
            <a href="/services/transmission/">Transmission</a>
            <a href="/services/ac-cooling/">AC & Cooling</a>
            <a href="/services/engine-repairs/">Engine Repairs</a>
            <a href="/services/fleet/">Fleet Services</a>
          </div>
        </div>`;

// For pages in services/ subdirectory, the Services link has active pill styling
const dropdownHTMLActive = `<div class="services-dropdown">
          <a href="#" class="nav-link px-4 py-2 rounded-full border border-navy text-navy font-medium text-sm flex items-center gap-1" onclick="return false;">
            Services
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"/></svg>
          </a>
          <div class="dropdown-menu">
            <a href="/services/brakes/">Brakes</a>
            <a href="/services/diagnostics/">Diagnostics</a>
            <a href="/services/suspension/">Suspension</a>
            <a href="/services/transmission/">Transmission</a>
            <a href="/services/ac-cooling/">AC & Cooling</a>
            <a href="/services/engine-repairs/">Engine Repairs</a>
            <a href="/services/fleet/">Fleet Services</a>
          </div>
        </div>`;

// Find all index.html files
function findFiles(dir) {
  let results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.name === "node_modules" || entry.name === "temporary screenshots") continue;
    if (entry.isDirectory()) results = results.concat(findFiles(full));
    else if (entry.name === "index.html") results.push(full);
  }
  return results;
}

const files = findFiles(ROOT);
let updated = 0;

for (const file of files) {
  let html = fs.readFileSync(file, "utf8");
  const relPath = path.relative(ROOT, file);
  const isServicePage = relPath.startsWith("services/");

  // Add CSS if not already there
  if (!html.includes("services-dropdown")) {
    html = html.replace("</style>", dropdownCSS + "\n  </style>");
  }

  const dropdown = isServicePage ? dropdownHTMLActive : dropdownHTML;

  // Pattern 1: Simple <a href="#" ...>Services<svg...></svg></a> on one line
  const p1 = /<a[^>]*href="#"[^>]*>[^<]*Services\s*<svg[^<]*<\/svg><\/a>/;
  if (p1.test(html)) {
    html = html.replace(p1, dropdown);
    fs.writeFileSync(file, html);
    console.log(`[FIXED] ${relPath} (pattern 1)`);
    updated++;
    continue;
  }

  // Pattern 2: Multi-line services link
  const p2 = /<a[^>]*href="#"[^>]*>\s*Services\s*<svg[\s\S]*?<\/svg>\s*<\/a>/;
  if (p2.test(html)) {
    html = html.replace(p2, dropdown);
    fs.writeFileSync(file, html);
    console.log(`[FIXED] ${relPath} (pattern 2)`);
    updated++;
    continue;
  }

  // Pattern 3: Agent-built pages with different nav structure — look for the services nav wrapper
  // Some agents wrapped it in a div already
  const p3 = /<div[^>]*class="[^"]*relative[^"]*"[^>]*>[\s\S]*?Services[\s\S]*?<\/div>\s*<\/div>/;
  if (p3.test(html) && html.includes("Services") && !html.includes("services-dropdown")) {
    // These already have dropdown-like structure, just need to ensure links are correct
    console.log(`[SKIP-COMPLEX] ${relPath} — has existing dropdown structure`);
    continue;
  }

  console.log(`[SKIP] ${relPath} — no matching pattern`);
}

console.log(`\nUpdated ${updated} files`);
