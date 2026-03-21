import { defineConfig } from "astro/config";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  site: "https://example.com",
  outDir: "./dist",
  vite: {
    resolve: {
      alias: {
        "@shared": path.resolve(__dirname, "./html/shared"),
        "@data": path.resolve(__dirname, "./html/data"),
      },
    },
  },
});
