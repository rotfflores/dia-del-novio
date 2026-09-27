import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const pageInput = process.argv[2];
if (!pageInput) {
  console.error("Uso: node scripts/preparar-compartir.mjs https://tu-dominio.com/");
  process.exit(1);
}

let pageUrl;
try {
  pageUrl = new URL(pageInput);
} catch {
  console.error("Indica la URL pública completa de la página.");
  process.exit(1);
}

if (pageUrl.protocol !== "https:" || pageUrl.username || pageUrl.password) {
  console.error("La URL de la página debe ser HTTPS y no incluir credenciales.");
  process.exit(1);
}
pageUrl.search = "";
pageUrl.hash = "";

const htmlPath = fileURLToPath(new URL("../dist/index.html", import.meta.url));
let html = await readFile(htmlPath, "utf8");
const imageUrl = new URL("./assets/portada-whatsapp.jpg", pageUrl).href;

function setMeta(attribute, name, value) {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = new RegExp(`<meta ${attribute}="${escaped}" content="[^"]*" \\/>`);
  if (!pattern.test(html)) throw new Error(`Falta la etiqueta ${name} en dist/index.html`);
  html = html.replace(pattern, `<meta ${attribute}="${name}" content="${value}" />`);
}

setMeta("property", "og:image", imageUrl);
setMeta("name", "twitter:image", imageUrl);
const urlTag = `<meta property="og:url" content="${pageUrl.href}" />`;
if (/<meta property="og:url" content="[^"]*" \/>/.test(html)) {
  html = html.replace(/<meta property="og:url" content="[^"]*" \/>/, urlTag);
} else {
  html = html.replace(/(<meta property="og:type" content="website" \/>)/, `$1\n    ${urlTag}`);
}
await writeFile(htmlPath, html);
console.log(`Portada para compartir: ${imageUrl}`);
