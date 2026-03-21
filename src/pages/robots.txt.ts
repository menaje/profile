import type { APIRoute } from "astro";

const FALLBACK_SITE_URL = "https://coni-example.vercel.app";

export const prerender = true;

export const GET: APIRoute = ({ site }) => {
  const origin = site ?? new URL(FALLBACK_SITE_URL);
  const body = [
    "User-agent: *",
    "Allow: /",
    "Disallow: /404",
    "Disallow: /404/",
    "Disallow: /keystatic/",
    `Sitemap: ${new URL("/sitemap.xml", origin).href}`,
  ].join("\n");

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
};
