import type { APIRoute } from "astro";
import { getFallbackSiteUrl, withBase } from "../lib/site";

export const prerender = true;

export const GET: APIRoute = ({ site }) => {
  const origin = site ?? getFallbackSiteUrl();
  const body = [
    "User-agent: *",
    `Allow: ${withBase("/")}`,
    `Disallow: ${withBase("/404")}`,
    `Disallow: ${withBase("/404/")}`,
    `Disallow: ${withBase("/keystatic/")}`,
    `Sitemap: ${new URL(withBase("/sitemap.xml"), origin).href}`,
  ].join("\n");

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
};
