import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootDir = __dirname;
const port = Number(process.env.PORT || 5173);

const mime = new Map([
  [".html", "text/html; charset=utf-8"],
  [".css", "text/css; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".mjs", "text/javascript; charset=utf-8"],
  [".svg", "image/svg+xml"],
  [".json", "application/json; charset=utf-8"],
  [".txt", "text/plain; charset=utf-8"],
]);

function safeJoin(base, target) {
  const targetPath = path.normalize(target).replace(/^(\.\.(\/|\\|$))+/, "");
  return path.join(base, targetPath);
}

function send(res, status, headers, body) {
  res.writeHead(status, headers);
  res.end(body);
}

const server = http.createServer((req, res) => {
  try {
    const url = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);
    const pathname = decodeURIComponent(url.pathname);
    const rel = pathname === "/" ? "/index.html" : pathname;
    const filePath = safeJoin(rootDir, rel);

    if (!filePath.startsWith(rootDir)) {
      send(res, 403, { "Content-Type": "text/plain; charset=utf-8" }, "Forbidden");
      return;
    }

    fs.stat(filePath, (err, stat) => {
      if (err || !stat.isFile()) {
        send(res, 404, { "Content-Type": "text/plain; charset=utf-8" }, "Not Found");
        return;
      }

      const ext = path.extname(filePath).toLowerCase();
      const type = mime.get(ext) || "application/octet-stream";
      res.writeHead(200, {
        "Content-Type": type,
        "Cache-Control": ext === ".html" ? "no-cache" : "public, max-age=300",
      });
      fs.createReadStream(filePath).pipe(res);
    });
  } catch {
    send(res, 500, { "Content-Type": "text/plain; charset=utf-8" }, "Server error");
  }
});

server.listen(port, () => {
  console.log(`Handan Idioms running at http://localhost:${port}/ (root: ${rootDir})`);
  console.log(`Tip: set PORT to change port (e.g. PORT=8080).`);
});
