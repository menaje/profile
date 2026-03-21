import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

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
  integrations: [mdx()],
  vite: {
    resolve: {
      alias: {
        "@shared": path.resolve(__dirname, "./html/shared"),
        "@data": path.resolve(__dirname, "./html/data"),
      },
    },
  },
});
