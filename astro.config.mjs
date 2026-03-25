import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import mdx from "@astrojs/mdx";
import react from "@astrojs/react";
import markdoc from "@astrojs/markdoc";
import keystatic from "@keystatic/astro";
const isKeystatic = !process.argv.includes("build");
const SITE_BASE_PATH = "/profile/";
const DEFAULT_SITE_URL = "https://menaje.github.io";
const EXCLUDED_SITEMAP_PATHS = new Set([
  "/404",
  "/404/",
  "/en",
  "/en/",
  "/keystatic",
  "/keystatic/",
  "/robots.txt",
  "/rss.xml",
  "/sitemap.xml",
]);

function normalizeSiteUrl(candidate) {
  if (!candidate) {
    return null;
  }

  const withProtocol = /^https?:\/\//.test(candidate) ? candidate : `https://${candidate}`;

  try {
    const url = new URL(withProtocol);
    url.pathname = "/";
    url.search = "";
    url.hash = "";
    return url;
  } catch {
    return null;
  }
}

function stripBasePath(pathname) {
  if (pathname === SITE_BASE_PATH.slice(0, -1) || pathname.startsWith(SITE_BASE_PATH)) {
    return pathname.slice(SITE_BASE_PATH.length - 1) || "/";
  }

  return pathname;
}

function getSiteUrl() {
  const candidates = [process.env.SITE_URL, process.env.PUBLIC_SITE_URL];

  for (const candidate of candidates) {
    const url = normalizeSiteUrl(candidate);

    if (url) {
      return url;
    }
  }

  return new URL(DEFAULT_SITE_URL);
}

const siteUrl = getSiteUrl();

export default defineConfig({
  site: siteUrl.toString(),
  base: SITE_BASE_PATH,
  outDir: "./dist",
  i18n: {
    defaultLocale: "ko",
    locales: ["ko", "en"],
    routing: {
      prefixDefaultLocale: false,
    },
  },
  integrations: [
    sitemap({
      filter: (page) => {
        const { pathname } = new URL(page, siteUrl);
        return !EXCLUDED_SITEMAP_PATHS.has(stripBasePath(pathname));
      },
    }),
    react(),
    markdoc(),
    mdx(),
    ...(isKeystatic ? [keystatic()] : []),
  ],
});
