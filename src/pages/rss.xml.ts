import type { APIRoute } from "astro";
import type { CollectionEntry } from "astro:content";
import { getCollection } from "astro:content";
import rss from "@astrojs/rss";
import { getFallbackSiteUrl, withBase } from "../lib/site";

export const prerender = true;

export const GET: APIRoute = async (context) => {
  const siteUrl = new URL(withBase("/"), context.site ?? getFallbackSiteUrl());
  const posts = await getCollection("blog", (entry: CollectionEntry<"blog">) => {
    return import.meta.env.PROD ? entry.data.draft !== true : true;
  });

  const sortedPosts = posts.sort(
    (a: CollectionEntry<"blog">, b: CollectionEntry<"blog">) =>
      b.data.publishedDate.getTime() - a.data.publishedDate.getTime(),
  );

  return rss({
    title: "김성식 블로그",
    description: "건설 CM 경험을 AI 협업 시스템 설계로 번역하는 과정과 프로젝트 회고를 기록합니다.",
    site: siteUrl,
    customData: "<language>ko-KR</language>",
    items: sortedPosts.map((post: CollectionEntry<"blog">) => ({
      title: post.data.title,
      description: post.data.description,
      link: withBase(`/blog/${post.id}/`),
      pubDate: post.data.publishedDate,
      categories: post.data.tags,
    })),
  });
};
