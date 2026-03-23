import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const blog = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/blog" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    publishedDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    draft: z.boolean().default(false),
    tags: z.array(z.string()).default([]),
    ogImage: z.string().optional(),
  }),
});

const caseStudies = defineCollection({
  loader: glob({
    pattern: "**/*.{md,mdx}",
    base: "./src/content/case-studies",
  }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    client: z.string(),
    domain: z.enum(["construction-cm", "ai-it"]),
    extraDomains: z.array(z.enum(["construction-cm", "ai-it"])).default([]),
    period: z.object({
      start: z.string(),
      end: z.string().optional(),
    }),
    role: z.string(),
    tags: z.array(z.string()).default([]),
    featured: z.boolean().default(false),
    draft: z.boolean().default(false),
    ogImage: z.string().optional(),
  }),
});

export const collections = { blog, "case-studies": caseStudies };
