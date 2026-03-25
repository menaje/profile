import type {
  BlogPosting,
  BreadcrumbList,
  CreativeWork,
  Person,
  ProfilePage,
  WebSite,
  WithContext,
} from "schema-dts";
import type { PublicProfile } from "./public-profile";
import { ensureBasePath, getFallbackSiteUrl } from "./site";

type StructuredThing = BlogPosting | BreadcrumbList | CreativeWork | Person | ProfilePage | WebSite;

export type StructuredData = WithContext<StructuredThing>;
export type StructuredDataInput = StructuredData | StructuredData[];

interface BreadcrumbItemInput {
  name: string;
  path: string;
}

interface StructuredDataBuilderInput {
  site?: URL | string;
  path: string;
}

interface PersonStructuredDataInput {
  site?: URL | string;
  profile: PublicProfile;
  description?: string;
}

interface WebSiteStructuredDataInput {
  site?: URL | string;
  profile: PublicProfile;
  description: string;
  name?: string;
}

interface ProfilePageStructuredDataInput extends StructuredDataBuilderInput {
  profile: PublicProfile;
  name: string;
  description: string;
}

interface BlogPostingStructuredDataInput extends StructuredDataBuilderInput {
  profile: PublicProfile;
  title: string;
  description: string;
  publishedDate: Date;
  updatedDate?: Date;
  ogImage?: string;
  tags?: string[];
}

interface CreativeWorkStructuredDataInput extends StructuredDataBuilderInput {
  profile: PublicProfile;
  title: string;
  description: string;
  dateCreated?: string;
  dateModified?: string;
  genre?: string;
  ogImage?: string;
  tags?: string[];
  abstractText?: string;
}

function resolveSiteUrl(site?: URL | string): URL {
  if (site instanceof URL) {
    return site;
  }

  if (site) {
    return new URL(site);
  }

  return getFallbackSiteUrl();
}

function resolveAbsoluteUrl(path: string, site?: URL | string): string {
  return new URL(ensureBasePath(path), resolveSiteUrl(site)).href;
}

function buildPersonNode({ site, profile, description }: PersonStructuredDataInput): Person {
  const sameAs = [profile.contacts.github.url, profile.contacts.linkedin.url];

  return {
    "@type": "Person",
    "@id": `${resolveAbsoluteUrl("/", site)}#person`,
    name: profile.name.ko,
    jobTitle: profile.positioningTitle,
    url: resolveAbsoluteUrl("/", site),
    ...(description ? { description } : {}),
    sameAs,
  };
}

export function buildPersonStructuredData(input: PersonStructuredDataInput): WithContext<Person> {
  const { site, profile, description } = input;

  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": `${resolveAbsoluteUrl("/", site)}#person`,
    name: profile.name.ko,
    jobTitle: profile.positioningTitle,
    url: resolveAbsoluteUrl("/", site),
    ...(description ? { description } : {}),
    sameAs: [profile.contacts.github.url, profile.contacts.linkedin.url],
  };
}

export function buildWebsiteStructuredData({
  site,
  profile,
  description,
  name = `${profile.name.ko} 포트폴리오`,
}: WebSiteStructuredDataInput): WithContext<WebSite> {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${resolveAbsoluteUrl("/", site)}#website`,
    url: resolveAbsoluteUrl("/", site),
    name,
    description,
    inLanguage: "ko-KR",
    creator: buildPersonNode({ site, profile }),
  };
}

export function buildBreadcrumbStructuredData({
  site,
  items,
}: {
  site?: URL | string;
  items: BreadcrumbItemInput[];
}): WithContext<BreadcrumbList> {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: resolveAbsoluteUrl(item.path, site),
    })),
  };
}

export function buildProfilePageStructuredData({
  site,
  path,
  profile,
  name,
  description,
}: ProfilePageStructuredDataInput): WithContext<ProfilePage> {
  return {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    name,
    description,
    url: resolveAbsoluteUrl(path, site),
    inLanguage: "ko-KR",
    isPartOf: resolveAbsoluteUrl("/", site),
    mainEntity: buildPersonNode({ site, profile, description }),
  };
}

export function buildBlogPostingStructuredData({
  site,
  path,
  profile,
  title,
  description,
  publishedDate,
  updatedDate,
  ogImage,
  tags = [],
}: BlogPostingStructuredDataInput): WithContext<BlogPosting> {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: title,
    name: title,
    description,
    url: resolveAbsoluteUrl(path, site),
    mainEntityOfPage: resolveAbsoluteUrl(path, site),
    datePublished: publishedDate.toISOString(),
    ...(updatedDate ? { dateModified: updatedDate.toISOString() } : {}),
    ...(ogImage ? { image: resolveAbsoluteUrl(ogImage, site) } : {}),
    ...(tags.length > 0 ? { keywords: tags.join(", ") } : {}),
    inLanguage: "ko-KR",
    author: buildPersonNode({ site, profile }),
    publisher: buildPersonNode({ site, profile }),
  };
}

export function buildCreativeWorkStructuredData({
  site,
  path,
  profile,
  title,
  description,
  dateCreated,
  dateModified,
  genre,
  ogImage,
  tags = [],
  abstractText,
}: CreativeWorkStructuredDataInput): WithContext<CreativeWork> {
  return {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: title,
    description,
    url: resolveAbsoluteUrl(path, site),
    mainEntityOfPage: resolveAbsoluteUrl(path, site),
    ...(dateCreated ? { dateCreated } : {}),
    ...(dateModified ? { dateModified } : {}),
    ...(genre ? { genre } : {}),
    ...(ogImage ? { image: resolveAbsoluteUrl(ogImage, site) } : {}),
    ...(tags.length > 0 ? { keywords: tags.join(", ") } : {}),
    ...(abstractText ? { abstract: abstractText } : {}),
    inLanguage: "ko-KR",
    author: buildPersonNode({ site, profile }),
  };
}

export function serializeStructuredData(data: StructuredData): string {
  return JSON.stringify(data)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}
