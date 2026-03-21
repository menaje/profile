import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import react from "@astrojs/react";
import markdoc from "@astrojs/markdoc";
import keystatic from "@keystatic/astro";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const isKeystatic = !process.argv.includes("build");

export default defineConfig({
  site: "https://example.com",
  outDir: "./dist",
  i18n: {
    defaultLocale: "ko",
    locales: ["ko", "en"],
    routing: {
      prefixDefaultLocale: false,
    },
  },
  integrations: [
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
