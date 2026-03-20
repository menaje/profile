import { createReadStream } from 'node:fs';
import { access, mkdir, readFile, stat } from 'node:fs/promises';
import http from 'node:http';
import path from 'node:path';
import { spawn, spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

import puppeteer from 'puppeteer-core';

const projectRoot = path.dirname(fileURLToPath(import.meta.url));
const workspaceRoot = path.resolve(projectRoot, '..');
const htmlRoot = path.join(projectRoot, 'html');
const outputRoot = path.join(workspaceRoot, 'output');
const tempRoot = path.join(workspaceRoot, '.coni', 'tmp');
const decktapeBin = path.join(projectRoot, 'node_modules', '.bin', 'decktape');
const browserExecutable = findBrowserExecutable();

const documentPdfOptions = {
  format: 'A4',
  margin: {
    top: '18mm',
    bottom: '18mm',
    left: '18mm',
    right: '18mm',
  },
  preferCSSPageSize: true,
  printBackground: true,
};

const targetMap = {
  resume: {
    kind: 'document',
    sourcePath: path.join(htmlRoot, 'resume', 'index.html'),
    outputPath: path.join(outputRoot, '01_김성식_이력서.pdf'),
  },
  technical: {
    kind: 'document',
    sourcePath: path.join(htmlRoot, 'technical-career', 'index.html'),
    outputPath: path.join(outputRoot, '02_김성식_기술경력서.pdf'),
  },
  statement: {
    kind: 'document',
    sourcePath: path.join(htmlRoot, 'personal-statement', 'index.html'),
    outputPath: path.join(outputRoot, '03_김성식_자기소개서.pdf'),
  },
  slides: {
    kind: 'slides',
    sourcePath: path.join(htmlRoot, 'haean-deck', 'index.html'),
    outputPath: path.join(outputRoot, '04_해안건축_제안서_슬라이드.pdf'),
    routePath: '/html/haean-deck/index.html',
  },
  smoke: {
    kind: 'document',
    sourcePath: path.join(htmlRoot, 'shared', 'smoke.html'),
    outputPath: path.join(tempRoot, 'WP-19-smoke.pdf'),
  },
};

const orderedTargets = ['resume', 'technical', 'statement', 'slides'];

try {
  await main();
} catch (error) {
  console.error(`Build failed: ${error.message}`);
  process.exitCode = 1;
}

async function main() {
  const requestedNames = resolveRequestedTargets(process.argv.slice(2));
  const requestedTargets = requestedNames.map((name) => ({ name, ...targetMap[name] }));

  await preflightTargets(requestedTargets);
  await buildTargets(requestedTargets);

  console.log(
    `Build complete: ${requestedTargets.map((target) => target.name).join(', ')}`,
  );
}

function resolveRequestedTargets(args) {
  if (args.length === 0 || args.includes('all')) {
    return [...orderedTargets];
  }

  const seen = new Set();

  for (const name of args) {
    if (!Object.hasOwn(targetMap, name)) {
      throw new Error(
        `Unknown target "${name}". Expected one of: all, ${[
          ...orderedTargets,
          'smoke',
        ].join(', ')}`,
      );
    }

    seen.add(name);
  }

  return [...seen];
}

async function preflightTargets(targets) {
  if (targets.length === 0) {
    throw new Error('No build targets were requested.');
  }

  await ensureDir(outputRoot);

  if (targets.some((target) => target.name === 'smoke')) {
    await ensureDir(tempRoot);
  }

  if (targets.some((target) => target.kind === 'slides')) {
    await assertExecutable(
      decktapeBin,
      `DeckTape binary is missing: ${decktapeBin}. Run "cd project && npm install" first.`,
    );
  }

  if (targets.some((target) => target.kind === 'document' || target.kind === 'slides')) {
    if (!browserExecutable) {
      throw new Error(
        [
          'Could not find a Chrome/Chromium executable for PDF export.',
          'Set PUPPETEER_EXECUTABLE_PATH or CHROME_PATH, or install Google Chrome.',
        ].join(' '),
      );
    }
  }

  for (const target of targets) {
    await assertFile(
      target.sourcePath,
      [
        `Missing source for "${target.name}": ${target.sourcePath}`,
        'Create the upstream HTML entrypoint first, then rerun the build.',
      ].join(' '),
    );
  }
}

async function buildTargets(targets) {
  const documentTargets = targets.filter((target) => target.kind === 'document');
  const slideTargets = targets.filter((target) => target.kind === 'slides');

  if (documentTargets.length > 0) {
    const browser = await puppeteer.launch({
      executablePath: browserExecutable,
      headless: true,
      args: ['--disable-dev-shm-usage'],
    });

    try {
      for (const target of documentTargets) {
        await exportDocument(browser, target);
      }
    } finally {
      await browser.close();
    }
  }

  for (const target of slideTargets) {
    await exportSlides(target);
  }
}

async function exportDocument(browser, target) {
  const page = await browser.newPage();
  const targetUrl = pathToFileURL(target.sourcePath).href;

  try {
    console.log(`Exporting ${target.name} -> ${target.outputPath}`);
    await page.goto(targetUrl, { waitUntil: 'networkidle0' });
    await page.emulateMediaType('print');
    await waitForFonts(page);
    await page.pdf({
      path: target.outputPath,
      ...documentPdfOptions,
    });
  } finally {
    await page.close();
  }
}

async function exportSlides(target) {
  console.log(`Exporting ${target.name} -> ${target.outputPath}`);

  const slideCount = await countRevealSlides(target.sourcePath);
  const server = await startStaticServer(projectRoot, {
    transformHtml(filePath, html) {
      if (filePath !== target.sourcePath) {
        return html;
      }

      return makeDecktapeRevealCompatible(html);
    },
  });
  const slideUrl = new URL(target.routePath, server.origin).href;

  try {
    await runCommand(decktapeBin, [
      '--chrome-path',
      browserExecutable,
      '--size',
      '1600x900',
      '--load-pause',
      '1000',
      '--pause',
      '750',
      '--slides',
      `1-${slideCount}`,
      'reveal',
      slideUrl,
      target.outputPath,
    ]);
  } finally {
    await server.close();
  }
}

async function waitForFonts(page) {
  await page.evaluate(async () => {
    if (document.fonts?.ready) {
      await document.fonts.ready;
    }
  });
}

async function ensureDir(dirPath) {
  await mkdir(dirPath, { recursive: true });
}

async function assertFile(filePath, message) {
  try {
    const fileStat = await stat(filePath);
    if (!fileStat.isFile()) {
      throw new Error(message);
    }
  } catch {
    throw new Error(message);
  }
}

async function assertExecutable(filePath, message) {
  try {
    await access(filePath);
  } catch {
    throw new Error(message);
  }
}

function findBrowserExecutable() {
  const candidates = [
    process.env.PUPPETEER_EXECUTABLE_PATH,
    process.env.CHROME_PATH,
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Chromium.app/Contents/MacOS/Chromium',
    which('google-chrome-stable'),
    which('google-chrome'),
    which('chromium-browser'),
    which('chromium'),
    which('chrome'),
  ].filter(Boolean);

  for (const candidate of candidates) {
    const resolved = candidate.trim();
    if (isExecutable(resolved)) {
      return resolved;
    }
  }

  return null;
}

function which(command) {
  const result = spawnSync('which', [command], {
    cwd: projectRoot,
    encoding: 'utf8',
  });

  if (result.status === 0) {
    return result.stdout.trim();
  }

  return null;
}

function isExecutable(filePath) {
  if (!filePath) {
    return false;
  }

  try {
    accessSyncFallback(filePath);
    return true;
  } catch {
    return false;
  }
}

function accessSyncFallback(filePath) {
  const result = spawnSync('test', ['-x', filePath], {
    cwd: projectRoot,
  });

  if (result.status !== 0) {
    throw new Error(`Not executable: ${filePath}`);
  }
}

async function startStaticServer(rootDir, options = {}) {
  const server = http.createServer(async (request, response) => {
    try {
      const filePath = resolveRequestPath(rootDir, request.url ?? '/');
      const fileStat = await stat(filePath);

      if (fileStat.isDirectory()) {
        throw new Error('Directory listing is not supported.');
      }

      const contentType = contentTypeFor(filePath);

      if (contentType.startsWith('text/html') && typeof options.transformHtml === 'function') {
        const html = await readFile(filePath, 'utf8');
        const transformed = options.transformHtml(filePath, html);

        response.writeHead(200, {
          'Cache-Control': 'no-store',
          'Content-Type': contentType,
        });
        response.end(transformed);
        return;
      }

      response.writeHead(200, {
        'Cache-Control': 'no-store',
        'Content-Type': contentType,
      });
      createReadStream(filePath).pipe(response);
    } catch (error) {
      const statusCode =
        error instanceof RangeError ? 403 : error?.code === 'ENOENT' ? 404 : 500;

      response.writeHead(statusCode, { 'Content-Type': 'text/plain; charset=utf-8' });
      response.end(`Static server error: ${error.message}`);
    }
  });

  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolve);
  });

  const address = server.address();
  const origin = `http://127.0.0.1:${address.port}`;

  return {
    origin,
    async close() {
      await new Promise((resolve, reject) => {
        server.close((error) => {
          if (error) {
            reject(error);
            return;
          }

          resolve();
        });
      });
    },
  };
}

function makeDecktapeRevealCompatible(html) {
  if (html.includes('window.Reveal = deck;')) {
    return html;
  }

  return html.replace(
    '      deck.initialize();',
    '      window.Reveal = deck;\n      deck.initialize();',
  );
}

async function countRevealSlides(filePath) {
  const html = await readFile(filePath, 'utf8');
  const slidesMarker = html.indexOf('<div class="slides">');

  if (slidesMarker === -1) {
    throw new Error(`Could not find ".slides" container in ${filePath}`);
  }

  const tagPattern = /<\/?(div|section)\b[^>]*>/g;
  tagPattern.lastIndex = slidesMarker;

  let divDepth = 0;
  let sectionDepth = 0;
  let slideCount = 0;

  for (const match of html.matchAll(tagPattern)) {
    if (match.index < slidesMarker) {
      continue;
    }

    const [tag, tagName] = match;
    const isClosingTag = tag.startsWith('</');
    const isSelfClosingTag = tag.endsWith('/>');

    if (tagName === 'div') {
      if (isClosingTag) {
        divDepth -= 1;
        if (divDepth === 0) {
          break;
        }
      } else if (!isSelfClosingTag) {
        divDepth += 1;
      }

      continue;
    }

    if (divDepth === 0) {
      continue;
    }

    if (isClosingTag) {
      sectionDepth = Math.max(sectionDepth - 1, 0);
      continue;
    }

    if (sectionDepth === 0) {
      slideCount += 1;
    }

    sectionDepth += 1;
  }

  if (slideCount === 0) {
    throw new Error(`Could not detect any top-level reveal.js slides in ${filePath}`);
  }

  return slideCount;
}

function resolveRequestPath(rootDir, requestUrl) {
  const parsedUrl = new URL(requestUrl, 'http://127.0.0.1');
  const relativePath = decodeURIComponent(parsedUrl.pathname);
  const requestedPath = relativePath.endsWith('/')
    ? `${relativePath}index.html`
    : relativePath;
  const normalizedPath = path.normalize(path.join(rootDir, requestedPath));
  const relativeToRoot = path.relative(rootDir, normalizedPath);

  if (relativeToRoot.startsWith('..') || path.isAbsolute(relativeToRoot)) {
    throw new RangeError(`Blocked path traversal: ${requestUrl}`);
  }

  return normalizedPath;
}

function contentTypeFor(filePath) {
  const extension = path.extname(filePath).toLowerCase();
  const contentTypes = {
    '.css': 'text/css; charset=utf-8',
    '.html': 'text/html; charset=utf-8',
    '.jpeg': 'image/jpeg',
    '.jpg': 'image/jpeg',
    '.js': 'text/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.mjs': 'text/javascript; charset=utf-8',
    '.otf': 'font/otf',
    '.png': 'image/png',
    '.svg': 'image/svg+xml',
    '.ttf': 'font/ttf',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
  };

  return contentTypes[extension] ?? 'application/octet-stream';
}

async function runCommand(command, args) {
  await new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: projectRoot,
      stdio: 'inherit',
    });

    child.on('error', reject);
    child.on('exit', (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(`Command failed (${code}): ${command} ${args.join(' ')}`));
    });
  });
}
