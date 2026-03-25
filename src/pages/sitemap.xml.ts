import type { APIRoute } from "astro";
import { getFallbackSiteUrl, withBase } from "../lib/site";

export const prerender = true;

export const GET: APIRoute = ({ site }) => {
  const origin = site ?? getFallbackSiteUrl();
  const sitemapIndexUrl = new URL(withBase("/sitemap-index.xml"), origin).href;
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${sitemapIndexUrl}</loc>
  </sitemap>
</sitemapindex>`;

  return new Response(body, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
    },
  });
};
