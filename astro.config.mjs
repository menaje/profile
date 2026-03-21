import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import mdx from "@astrojs/mdx";
import react from "@astrojs/react";
import markdoc from "@astrojs/markdoc";
import keystatic from "@keystatic/astro";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const isKeystatic = !process.argv.includes("build");
const DEFAULT_SITE_URL = "https://coni-example.vercel.app";
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

  const withProtocol = /^https?:\/\//.test(candidate)
    ? candidate
    : `https://${candidate}`;

  try {
    return new URL(withProtocol);
  } catch {
    return null;
  }
}

function getSiteUrl() {
  const candidates = [
    process.env.SITE_URL,
    process.env.PUBLIC_SITE_URL,
    process.env.URL,
    process.env.DEPLOY_PRIME_URL,
    process.env.VERCEL_PROJECT_PRODUCTION_URL,
    process.env.VERCEL_URL,
  ];

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
        return !EXCLUDED_SITEMAP_PATHS.has(pathname);
      },
    }),
    react(),
    markdoc(),
    mdx(),
    ...(isKeystatic ? [keystatic()] : []),
  ],
  vite: {
    resolve: {
      alias: {
        "@shared": path.resolve(__dirname, "./html/shared"),
        "@data": path.resolve(__dirname, "./html/data"),
      },
    },
  },
});
