import http from "node:http";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { resolve, relative, extname, isAbsolute } from "node:path";

const root = fileURLToPath(new URL("./", import.meta.url));
const port = Number(process.env.PORT || 4186);
const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".mp3": "audio/mpeg",
};

http.createServer(async (request, response) => {
  if (request.method !== "GET" && request.method !== "HEAD") {
    response.writeHead(405, { Allow: "GET, HEAD" }).end();
    return;
  }
  try {
    const pathname = decodeURIComponent(new URL(request.url, "http://localhost").pathname);
    const filePath = resolve(root, `.${pathname === "/" ? "/index.html" : pathname}`);
    const pathFromRoot = relative(root, filePath);
    if (pathFromRoot.startsWith("..") || isAbsolute(pathFromRoot)) {
      response.writeHead(403).end("Forbidden");
      return;
    }
    const file = await readFile(filePath);
    response.writeHead(200, { "Content-Type": types[extname(filePath).toLowerCase()] || "application/octet-stream", "Cache-Control": "no-store", "X-Robots-Tag": "noindex, nofollow, noarchive" });
    response.end(request.method === "HEAD" ? undefined : file);
  } catch (error) {
    response.writeHead(error.code === "ENOENT" ? 404 : 400).end("Not found");
  }
}).listen(port, "127.0.0.1", () => console.log(`Lu + Gustavo: http://127.0.0.1:${port}`));

