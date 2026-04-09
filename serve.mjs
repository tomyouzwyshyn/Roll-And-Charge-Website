import http from "node:http";
import fs from "node:fs";
import path from "node:path";

const PORT = 3000;
const ROOT = decodeURIComponent(path.dirname(new URL(import.meta.url).pathname));

const MIME = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "application/javascript",
  ".mjs": "application/javascript",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".otf": "font/otf",
};

const server = http.createServer((req, res) => {
  let filePath = path.join(ROOT, decodeURIComponent(req.url.split("?")[0]));
  if (filePath.endsWith("/")) filePath = path.join(filePath, "index.html");

  const tryServe = (fp) => {
    fs.stat(fp, (err, stats) => {
      if (err || !stats) {
        res.writeHead(404, { "Content-Type": "text/plain" });
        res.end("404 Not Found");
        return;
      }
      if (stats.isDirectory()) {
        return tryServe(path.join(fp, "index.html"));
      }
      if (!stats.isFile()) {
        res.writeHead(404, { "Content-Type": "text/plain" });
        res.end("404 Not Found");
        return;
      }
      const ext = path.extname(fp).toLowerCase();
      const mime = MIME[ext] || "application/octet-stream";
      res.writeHead(200, { "Content-Type": mime });
      fs.createReadStream(fp).pipe(res);
    });
  };
  tryServe(filePath);
});

server.listen(PORT, () => {
  console.log(`Serving ${ROOT} at http://localhost:${PORT}`);
});
