import http from "node:http";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { resolve, relative, extname, isAbsolute } from "node:path";

const root = fileURLToPath(new URL("./dist/", import.meta.url));
const prizeFixture = process.argv.includes("--prize-fixture");
const port = Number(process.env.PORT || (prizeFixture ? 4174 : 4173));
const types = { ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".svg": "image/svg+xml", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".webp": "image/webp", ".avif": "image/avif" };

const server = http.createServer(async (request, response) => {
  if (request.method !== "GET" && request.method !== "HEAD") {
    response.writeHead(405, { Allow: "GET, HEAD" }).end();
    return;
  }
  try {
    const pathname = decodeURIComponent(new URL(request.url, "http://localhost").pathname);
    // Adaptador de prueba local: nunca se incluye en dist ni en la vista normal.
    if (prizeFixture && pathname === "/__tests/finish-game.js") {
      const fixture = await readFile(new URL("./tests/fixtures/finish-game.js", import.meta.url));
      response.writeHead(200, { "Content-Type": types[".js"], "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" });
      response.end(request.method === "HEAD" ? undefined : fixture);
      return;
    }
    const filePath = resolve(root, `.${pathname === "/" ? "/index.html" : pathname}`);
    const pathFromRoot = relative(root, filePath);
    if (pathFromRoot.startsWith("..") || isAbsolute(pathFromRoot)) {
      response.writeHead(403).end("Forbidden");
      return;
    }
    let file = await readFile(filePath);
    if (prizeFixture && filePath === resolve(root, "index.html")) {
      file = file.toString("utf8").replace("</head>", '<script src="/__tests/finish-game.js" defer></script></head>');
    }
    response.writeHead(200, { "Content-Type": types[extname(filePath).toLowerCase()] || "application/octet-stream", "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" });
    response.end(request.method === "HEAD" ? undefined : file);
  } catch (error) {
    response.writeHead(error.code === "ENOENT" ? 404 : 400).end("Not found");
  }
});

server.on("error", (error) => { console.error(error.message); process.exitCode = 1; });
server.listen(port, "127.0.0.1", () => { console.log(`Nuestra aventura: http://127.0.0.1:${port}`); });
