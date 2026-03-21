import type { APIRoute } from "astro";

const FALLBACK_SITE_URL = "https://coni-example.vercel.app";

export const prerender = true;

export const GET: APIRoute = ({ site }) => {
  const origin = site ?? new URL(FALLBACK_SITE_URL);
  const sitemapIndexUrl = new URL("/sitemap-index.xml", origin).href;
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
