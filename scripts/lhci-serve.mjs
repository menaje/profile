import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize, resolve } from "node:path";
import { constants as zlibConstants, createBrotliCompress, createGzip } from "node:zlib";

const BASE_PATH = "/profile";
const DIST_DIR = resolve("dist");
const PORT = Number.parseInt(process.env.PORT ?? "4173", 10);

const CONTENT_TYPES = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
  ".woff2": "font/woff2",
  ".xml": "application/xml; charset=utf-8",
};

function isCompressible(contentType) {
  return (
    contentType.startsWith("text/") ||
    contentType.startsWith("application/javascript") ||
    contentType.startsWith("application/json") ||
    contentType.startsWith("application/xml")
  );
}

function selectEncoding(acceptEncoding, contentType) {
  if (!acceptEncoding || !isCompressible(contentType)) {
    return null;
  }

  if (acceptEncoding.includes("br")) {
    return "br";
  }

  if (acceptEncoding.includes("gzip")) {
    return "gzip";
  }

  return null;
}

function resolveFilePath(pathname) {
  const withoutBase = pathname.slice(BASE_PATH.length) || "/";
  const normalizedPath = normalize(withoutBase).replace(/^(\.\.(\/|\\|$))+/, "");
  const candidate = join(DIST_DIR, normalizedPath);

  if (existsSync(candidate) && statSync(candidate).isFile()) {
    return candidate;
  }

  if (existsSync(candidate) && statSync(candidate).isDirectory()) {
    const indexFile = join(candidate, "index.html");
    if (existsSync(indexFile)) {
      return indexFile;
    }
  }

  if (!extname(candidate)) {
    const htmlFile = `${candidate}.html`;
    if (existsSync(htmlFile)) {
      return htmlFile;
    }

    const nestedIndexFile = join(candidate, "index.html");
    if (existsSync(nestedIndexFile)) {
      return nestedIndexFile;
    }
  }

  return null;
}

const server = createServer((request, response) => {
  const url = new URL(request.url ?? "/", `http://${request.headers.host ?? "127.0.0.1"}`);
  const { pathname } = url;

  if (pathname === "/") {
    response.writeHead(302, { Location: `${BASE_PATH}/` });
    response.end();
    return;
  }

  if (pathname === BASE_PATH) {
    response.writeHead(302, { Location: `${BASE_PATH}/` });
    response.end();
    return;
  }

  if (!pathname.startsWith(`${BASE_PATH}/`)) {
    response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Not Found");
    return;
  }

  const filePath = resolveFilePath(pathname);

  if (!filePath) {
    response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Not Found");
    return;
  }

  const contentType = CONTENT_TYPES[extname(filePath)] ?? "application/octet-stream";
  const encoding = selectEncoding(request.headers["accept-encoding"], contentType);
  const headers = {
    "Content-Type": contentType,
    Vary: "Accept-Encoding",
  };

  if (encoding) {
    headers["Content-Encoding"] = encoding;
  }

  response.writeHead(200, headers);

  if (request.method === "HEAD") {
    response.end();
    return;
  }

  const stream = createReadStream(filePath);

  if (encoding === "br") {
    stream
      .pipe(
        createBrotliCompress({
          params: {
            [zlibConstants.BROTLI_PARAM_QUALITY]: 4,
          },
        }),
      )
      .pipe(response);
    return;
  }

  if (encoding === "gzip") {
    stream.pipe(createGzip({ level: 6 })).pipe(response);
    return;
  }

  stream.pipe(response);
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(`LHCI server ready on http://127.0.0.1:${PORT}${BASE_PATH}/`);
});
