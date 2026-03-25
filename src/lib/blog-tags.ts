import { withBase } from "./site";

export interface BlogTagDescriptor {
  label: string;
  slug: string;
  href: string;
}

interface BlogPostLike {
  data: {
    tags: string[];
  };
}

function normalizeBlogTag(tag: string): string {
  return tag.trim();
}

export function getBlogTagSlug(tag: string): string {
  return normalizeBlogTag(tag);
}

export function getBlogTagHref(tag: string): string {
  return withBase(`/blog/tags/${getBlogTagSlug(tag)}/`);
}

export function getBlogTagDescriptor(tag: string): BlogTagDescriptor {
  const label = normalizeBlogTag(tag);

  return {
    label,
    slug: getBlogTagSlug(label),
    href: getBlogTagHref(label),
  };
}

export function getBlogTagDescriptors(posts: BlogPostLike[]): BlogTagDescriptor[] {
  const uniqueTags = new Map<string, BlogTagDescriptor>();

  for (const post of posts) {
    for (const rawTag of post.data.tags) {
      const label = normalizeBlogTag(rawTag);

      if (!label || uniqueTags.has(label)) {
        continue;
      }

      uniqueTags.set(label, getBlogTagDescriptor(label));
    }
  }

  return [...uniqueTags.values()].sort((left, right) =>
    left.label.localeCompare(right.label, "ko"),
  );
}

export function postHasBlogTag(post: BlogPostLike, tag: string): boolean {
  const normalizedTag = normalizeBlogTag(tag);

  return post.data.tags.some((entry) => normalizeBlogTag(entry) === normalizedTag);
}
