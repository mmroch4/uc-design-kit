/**
 * The local web server and the public-kit route shared by the browser checks
 * (check-pages.mjs and check-a11y.mjs): pages are served from the repository
 * over HTTP, and requests to the published kit are answered from kit/ on disk,
 * so a check never depends on the live site.
 */
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

/** The kit's public URL, as the template and the examples load it. */
export const PUBLIC_KIT = "https://uc-design-kit.miguelrocha.dev/kit/";

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json",
  ".map": "application/json",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".gif": "image/gif",
  ".pdf": "application/pdf",
  ".woff2": "font/woff2",
  ".java": "text/plain; charset=utf-8",
  ".py": "text/plain; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
};

/** The Content-Type for a file, by extension. */
export const contentType = (file) => MIME_TYPES[path.extname(file).toLowerCase()] || "application/octet-stream";

/** Serves the repository on a free port of 127.0.0.1; resolves with the listening server. */
export function startServer() {
  const server = createServer(async (request, response) => {
    const url = new URL(request.url, "http://localhost");
    let file = path.join(ROOT, decodeURIComponent(url.pathname));
    if (!file.startsWith(ROOT)) return response.writeHead(403).end();
    try {
      if ((await stat(file)).isDirectory()) file = path.join(file, "index.html");
      response.writeHead(200, { "Content-Type": contentType(file) }).end(await readFile(file));
    } catch {
      response.writeHead(404).end("Not found");
    }
  });
  return new Promise((resolve) => server.listen(0, "127.0.0.1", () => resolve(server)));
}

/** Answers the context's requests to PUBLIC_KIT from kit/ on disk. */
export async function routePublicKit(context) {
  await context.route(`${PUBLIC_KIT}**`, async (route) => {
    const file = path.join(ROOT, decodeURIComponent(new URL(route.request().url()).pathname));
    if (!file.startsWith(path.join(ROOT, "kit") + path.sep)) return route.fulfill({ status: 404 });
    try {
      const body = await readFile(file);
      await route.fulfill({ status: 200, body, headers: { "Content-Type": contentType(file), "Access-Control-Allow-Origin": "*" } });
    } catch {
      await route.fulfill({ status: 404 });
    }
  });
}
